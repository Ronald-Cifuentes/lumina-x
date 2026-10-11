/**
 * Shared by the proxy (optimistic redirect) and the server-side session
 * checks, so it must not import server-only modules.
 */
export const isSecureSite = (siteUrl: string | undefined): boolean =>
  (siteUrl ?? '').startsWith('https://');

export const adminCookieName = (siteUrl: string | undefined): string =>
  isSecureSite(siteUrl) ? '__Host-lumina_admin' : 'lumina_admin';
