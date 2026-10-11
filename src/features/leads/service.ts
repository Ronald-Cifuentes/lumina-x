import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import type { z } from 'zod';
import type { Database } from '@/db/client';
import { inquiries, ownerSubmissions, properties } from '@/db/schema';
import { consumeRateLimits } from '@/shared/security/rate-limit';
import { CONSENT_VERSION, type InquiryKind } from './domain';
import { type ErrorFormState, type FormState, HONEYPOT_FIELD } from './form-state';
import { createAdvisorySchema, createVisitSchema, firstErrors, inquirySchema, ownerSchema } from './schemas';

export type LeadLimits = { perClient: number; global: number; windowMs: number };

export type LeadContext = {
  db: Database;
  clientKey: string;
  limits: LeadLimits;
  now?: Date;
};

type LeadChannel = InquiryKind | 'propietario';

export const SPAM_REJECTION = 'No pudimos procesar la solicitud. Revisa los datos e inténtalo de nuevo.';
export const PERSISTENCE_FAILURE =
  'No pudimos registrar tu solicitud en este momento. No se guardó ningún dato; inténtalo de nuevo en unos minutos.';

const SUCCESS_MESSAGES: Record<LeadChannel, string> = {
  consulta: 'Recibimos tu consulta. Un asesor te responderá por correo o teléfono en horario hábil.',
  visita:
    'Tu solicitud de visita quedó registrada. No es una cita confirmada: un asesor te contactará para confirmar la fecha y la hora.',
  asesoria:
    'Recibimos tu solicitud de asesoría. Te contactaremos para acordar el horario; la solicitud aún no es una cita confirmada.',
  propietario: 'Recibimos la información de tu inmueble. Un asesor revisará los datos y te contactará.',
};

const reference = (id: string) => id.slice(0, 8).toUpperCase();

const echoValues = (raw: Record<string, unknown>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(raw).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === 'string' && entry[0] !== HONEYPOT_FIELD && !entry[0].startsWith('$'),
    ),
  );

const isSpam = (raw: Record<string, unknown>) => {
  const trap = raw[HONEYPOT_FIELD];
  return typeof trap === 'string' && trap.trim().length > 0;
};

const validationError = (error: z.ZodError, raw: Record<string, unknown>): FormState => ({
  status: 'error',
  message: 'Revisa los campos marcados.',
  fieldErrors: firstErrors(error),
  values: echoValues(raw),
});

const checkRateLimit = async (channel: LeadChannel, context: LeadContext, now: Date): Promise<ErrorFormState | null> => {
  const { limits } = context;
  const decision = await consumeRateLimits(
    context.db,
    [
      { key: `lead:${channel}:${context.clientKey}`, limit: limits.perClient, windowMs: limits.windowMs },
      { key: `lead:${channel}:global`, limit: limits.global, windowMs: limits.windowMs },
    ],
    now.getTime(),
  );
  if (decision.allowed) return null;
  const minutes = Math.ceil(decision.retryAfterSeconds / 60);
  return {
    status: 'error',
    message: `Recibimos demasiadas solicitudes seguidas. Inténtalo de nuevo en ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}.`,
  };
};

const findOpenProperty = async (db: Database, propertyId: string) => {
  const [property] = await db
    .select({ id: properties.id, availability: properties.availability })
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.published, true)))
    .limit(1);
  return property ?? null;
};

const persist = async (write: () => Promise<unknown>, channel: LeadChannel, id: string): Promise<FormState> => {
  try {
    await write();
  } catch (error) {
    console.error(`[leads] No se pudo guardar la solicitud (${channel})`, error);
    return { status: 'error', message: PERSISTENCE_FAILURE };
  }
  return { status: 'success', message: SUCCESS_MESSAGES[channel], reference: reference(id) };
};

export const submitPropertyLead = async (
  kind: 'consulta' | 'visita',
  raw: Record<string, unknown>,
  context: LeadContext,
): Promise<FormState> => {
  const now = context.now ?? new Date();
  if (isSpam(raw)) return { status: 'error', message: SPAM_REJECTION };
  const schema = kind === 'visita' ? createVisitSchema(now) : inquirySchema;
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error, raw);
  const input = parsed.data;

  const property = await findOpenProperty(context.db, input.propertyId);
  if (!property) {
    return { status: 'error', message: 'Este inmueble ya no recibe solicitudes.', values: echoValues(raw) };
  }
  if (kind === 'visita' && property.availability === 'reservado') {
    return {
      status: 'error',
      message: 'Este inmueble está reservado y no admite visitas. Puedes enviarnos una consulta.',
      values: echoValues(raw),
    };
  }

  const limited = await checkRateLimit(kind, context, now);
  if (limited) return { ...limited, values: echoValues(raw) };

  const id = randomUUID();
  const visit = 'preferredDate' in input ? input : null;
  return persist(
    () =>
      context.db.insert(inquiries).values({
        id,
        kind,
        propertyId: property.id,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        message: input.message ?? null,
        preferredDate: visit?.preferredDate ?? null,
        preferredTime: visit?.preferredTime ?? null,
        consentAt: now,
        consentVersion: CONSENT_VERSION,
        createdAt: now,
      }),
    kind,
    id,
  );
};

export const submitAdvisoryLead = async (raw: Record<string, unknown>, context: LeadContext): Promise<FormState> => {
  const now = context.now ?? new Date();
  if (isSpam(raw)) return { status: 'error', message: SPAM_REJECTION };
  const parsed = createAdvisorySchema(now).safeParse(raw);
  if (!parsed.success) return validationError(parsed.error, raw);
  const input = parsed.data;

  const limited = await checkRateLimit('asesoria', context, now);
  if (limited) return { ...limited, values: echoValues(raw) };

  const id = randomUUID();
  return persist(
    () =>
      context.db.insert(inquiries).values({
        id,
        kind: 'asesoria',
        propertyId: null,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        message: input.message,
        preferredDate: input.preferredDate ?? null,
        preferredTime: input.preferredTime ?? null,
        consentAt: now,
        consentVersion: CONSENT_VERSION,
        createdAt: now,
      }),
    'asesoria',
    id,
  );
};

export const submitOwnerLead = async (raw: Record<string, unknown>, context: LeadContext): Promise<FormState> => {
  const now = context.now ?? new Date();
  if (isSpam(raw)) return { status: 'error', message: SPAM_REJECTION };
  const parsed = ownerSchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error, raw);
  const input = parsed.data;

  const limited = await checkRateLimit('propietario', context, now);
  if (limited) return { ...limited, values: echoValues(raw) };

  const id = randomUUID();
  return persist(
    () =>
      context.db.insert(ownerSubmissions).values({
        id,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        propertyType: input.propertyType,
        municipality: input.municipality,
        neighborhood: input.neighborhood,
        areaM2: input.areaM2,
        bedrooms: input.bedrooms,
        expectedRent: input.expectedRent,
        message: input.message ?? null,
        consentAt: now,
        consentVersion: CONSENT_VERSION,
        createdAt: now,
      }),
    'propietario',
    id,
  );
};
