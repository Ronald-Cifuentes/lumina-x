import 'server-only';
import { z } from 'zod';
import { resolveSiteUrl } from './site-url';

const optionalText = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (typeof value === 'string' && value.trim() === '' ? undefined : value), schema.optional());

const positiveInt = (fallback: number) => z.coerce.number().int().positive().default(fallback);

const envSchema = z.object({
  SITE_URL: z.url(),
  WHATSAPP_BUSINESS_NUMBER: optionalText(z.string().regex(/^\d{8,15}$/, 'Solo dígitos, con indicativo de país.')),
  ADMIN_EMAIL: optionalText(z.email()),
  ADMIN_PASSWORD_HASH: optionalText(z.string().startsWith('scrypt:')),
  FORM_RATE_LIMIT_MAX: positiveInt(5),
  FORM_RATE_LIMIT_WINDOW_SECONDS: positiveInt(900),
  FORM_GLOBAL_RATE_LIMIT_MAX: positiveInt(300),
  LOGIN_RATE_LIMIT_MAX: positiveInt(5),
  LOGIN_RATE_LIMIT_WINDOW_SECONDS: positiveInt(900),
});

export type ServerEnv = z.infer<typeof envSchema>;

let cached: ServerEnv | undefined;

export const getServerEnv = (): ServerEnv => {
  if (cached) return cached;
  const parsed = envSchema.safeParse({ ...process.env, SITE_URL: resolveSiteUrl(process.env) });
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`Variables de entorno inválidas: ${details}`);
  }
  cached = parsed.data;
  return cached;
};

export const getSiteUrl = (): URL => new URL(getServerEnv().SITE_URL);

export const isAdminConfigured = (): boolean => {
  const env = getServerEnv();
  return Boolean(env.ADMIN_EMAIL && env.ADMIN_PASSWORD_HASH);
};
