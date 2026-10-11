import { z } from 'zod';
import { LEAD_STATUSES } from '@/features/leads/domain';
import { AVAILABILITY } from '@/features/properties/domain';
import { sanitizeText } from '@/shared/lib/text';

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');
const checkbox = z.preprocess((value) => value === 'on' || value === 'true', z.boolean());
const money = (min: number, max: number, message: string) =>
  z.preprocess(
    (value) => asString(value).replace(/[.\s$]/g, ''),
    z.coerce.number({ error: message }).int(message).min(min, message).max(max, message),
  );

export const loginSchema = z.object({
  email: z.preprocess((value) => asString(value).trim().toLowerCase(), z.email('Escribe un correo válido.')),
  password: z.string().min(1, 'Escribe la contraseña.').max(256),
});

export const propertyUpdateSchema = z.object({
  name: z.preprocess((value) => sanitizeText(asString(value)), z.string().min(4, 'Nombre muy corto.').max(90)),
  summary: z.preprocess((value) => sanitizeText(asString(value)), z.string().min(20, 'Resumen muy corto.').max(160)),
  description: z.preprocess(
    (value) => sanitizeText(asString(value), { multiline: true }),
    z.string().min(80, 'Descripción muy corta.').max(4000),
  ),
  monthlyRent: money(300_000, 100_000_000, 'Canon entre $300.000 y $100.000.000.'),
  administrationFee: z.preprocess(
    (value) => (asString(value).trim() === '' ? null : asString(value).replace(/[.\s$]/g, '')),
    z.coerce
      .number({ error: 'Administración inválida.' })
      .int('Administración inválida.')
      .min(0, 'Administración inválida.')
      .max(20_000_000, 'Administración inválida.')
      .nullable(),
  ),
  availability: z.enum(AVAILABILITY, { error: 'Disponibilidad inválida.' }),
  amenities: z.preprocess(
    (value) =>
      asString(value)
        .split(/[,\n]/)
        .map((item) => sanitizeText(item))
        .filter(Boolean),
    z.array(z.string().max(40)).min(1, 'Incluye al menos una amenidad.').max(20),
  ),
  furnished: checkbox,
  petsAllowed: checkbox,
  featured: checkbox,
  published: checkbox,
});

export type PropertyUpdate = z.infer<typeof propertyUpdateSchema>;

export const propertyIdSchema = z.string().regex(/^lum-\d{3}$/);
export const availabilitySchema = z.enum(AVAILABILITY);
export const leadStatusSchema = z.enum(LEAD_STATUSES);
export const leadIdSchema = z.uuid();
