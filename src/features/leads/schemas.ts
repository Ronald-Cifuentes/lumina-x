import { z } from 'zod';
import { MUNICIPALITIES, PROPERTY_TYPES } from '@/features/properties/domain';
import { sanitizeText } from '@/shared/lib/text';
import { VISIT_TIME_SLOTS, VISIT_WINDOW_DAYS } from './domain';

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');

const singleLine = (min: number, max: number, message: string) =>
  z.preprocess(
    (value) => sanitizeText(asString(value)),
    z.string().min(min, message).max(max, `Máximo ${max} caracteres.`),
  );

const multiline = (min: number, max: number, message: string) =>
  z.preprocess(
    (value) => sanitizeText(asString(value), { multiline: true }),
    z.string().min(min, message).max(max, `Máximo ${max} caracteres.`),
  );

const optionalMultiline = (max: number) =>
  z.preprocess(
    (value) => sanitizeText(asString(value), { multiline: true }) || undefined,
    z.string().max(max, `Máximo ${max} caracteres.`).optional(),
  );

const normalizePhone = (value: unknown): string =>
  asString(value)
    .replace(/[\s().-]/g, '')
    .replace(/^00/, '+');

const contactFields = {
  fullName: singleLine(3, 80, 'Escribe tu nombre completo.'),
  email: z.preprocess(
    (value) => asString(value).trim().toLowerCase(),
    z.email('Escribe un correo electrónico válido.').max(120, 'Máximo 120 caracteres.'),
  ),
  phone: z.preprocess(
    normalizePhone,
    z.string().regex(/^\+?\d{7,15}$/, 'Escribe un teléfono válido, solo números (7 a 15 dígitos).'),
  ),
  consent: z.preprocess(
    (value) => value === 'on' || value === 'true',
    z.literal(true, { error: 'Debes aceptar el aviso de privacidad para continuar.' }),
  ),
};

const propertyIdField = z.preprocess(
  (value) => asString(value).trim(),
  z.string().regex(/^lum-\d{3}$/, 'El inmueble de la solicitud no es válido.'),
);

const BOGOTA_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const DAY_MS = 86_400_000;

export const bogotaDate = (date: Date): string => BOGOTA_DATE.format(date);

export const visitDateBounds = (now: Date) => ({
  min: bogotaDate(new Date(now.getTime() + DAY_MS)),
  max: bogotaDate(new Date(now.getTime() + VISIT_WINDOW_DAYS * DAY_MS)),
});

const isSunday = (isoDate: string): boolean => new Date(`${isoDate}T12:00:00Z`).getUTCDay() === 0;

const preferredDateField = (now: Date) => {
  const { min, max } = visitDateBounds(now);
  return z
    .iso.date('Elige una fecha válida.')
    .refine((date) => date >= min, 'Elige una fecha a partir de mañana.')
    .refine((date) => date <= max, `Elige una fecha dentro de los próximos ${VISIT_WINDOW_DAYS} días.`)
    .refine((date) => !isSunday(date), 'Las visitas se programan de lunes a sábado.');
};

const preferredTimeField = z.enum(VISIT_TIME_SLOTS, { error: 'Elige una franja horaria.' });

export const inquirySchema = z.object({
  ...contactFields,
  propertyId: propertyIdField,
  message: multiline(10, 1200, 'Cuéntanos tu consulta (mínimo 10 caracteres).'),
});

export const createVisitSchema = (now: Date) =>
  z.object({
    ...contactFields,
    propertyId: propertyIdField,
    preferredDate: preferredDateField(now),
    preferredTime: preferredTimeField,
    message: optionalMultiline(1200),
  });

export const createAdvisorySchema = (now: Date) =>
  z.object({
    ...contactFields,
    message: multiline(10, 1200, 'Cuéntanos qué estás buscando (mínimo 10 caracteres).'),
    preferredDate: z.preprocess(
      (value) => asString(value).trim() || undefined,
      preferredDateField(now).optional(),
    ),
    preferredTime: z.preprocess((value) => asString(value).trim() || undefined, preferredTimeField.optional()),
  });

const integerField = (min: number, max: number, message: string) =>
  z.preprocess(
    (value) => asString(value).replace(/[.\s$]/g, ''),
    z.coerce.number({ error: message }).int(message).min(min, message).max(max, message),
  );

export const ownerSchema = z.object({
  ...contactFields,
  propertyType: z.enum(PROPERTY_TYPES, { error: 'Elige el tipo de inmueble.' }),
  municipality: z.enum(MUNICIPALITIES, { error: 'Elige el municipio.' }),
  neighborhood: singleLine(2, 60, 'Escribe el barrio o sector.'),
  areaM2: integerField(15, 2000, 'Escribe un área entre 15 y 2.000 m².'),
  bedrooms: integerField(0, 10, 'Escribe un número de habitaciones entre 0 y 10.'),
  expectedRent: integerField(500_000, 100_000_000, 'Escribe un canon entre $500.000 y $100.000.000.'),
  message: optionalMultiline(1200),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
export type VisitInput = z.infer<ReturnType<typeof createVisitSchema>>;
export type AdvisoryInput = z.infer<ReturnType<typeof createAdvisorySchema>>;
export type OwnerInput = z.infer<typeof ownerSchema>;

export const firstErrors = (error: z.ZodError): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    fieldErrors[key] ??= issue.message;
  }
  return fieldErrors;
};
