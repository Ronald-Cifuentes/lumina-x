export const DEFAULT_SITE_URL = 'http://localhost:3000';

type Env = Record<string, string | undefined>;

/**
 * Public origin used for canonical URLs, Open Graph, the sitemap and secure cookies.
 * `SITE_URL` wins; on Vercel the project's production domain (`VERCEL_PROJECT_PRODUCTION_URL`, a system
 * variable present at build and run time) is the fallback, so previews also point crawlers to production.
 */
export const resolveSiteUrl = (env: Env = process.env): string => {
  const explicit = env.SITE_URL?.trim();
  if (explicit) return explicit;
  const production = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  return production ? `https://${production}` : DEFAULT_SITE_URL;
};
