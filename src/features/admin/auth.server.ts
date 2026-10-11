import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { getDatabase } from '@/db/client';
import { getServerEnv } from '@/shared/config/env.server';
import { adminCookieName, isSecureSite } from './cookie';
import { type AdminSession, createSession, deleteSession, findSession } from './session';

const cookieName = () => adminCookieName(getServerEnv().SITE_URL);

const configuredEmail = (): string | null => {
  const env = getServerEnv();
  return env.ADMIN_EMAIL && env.ADMIN_PASSWORD_HASH ? env.ADMIN_EMAIL.toLowerCase() : null;
};

export const sameText = (a: string, b: string): boolean => {
  const digest = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
};

/** Data access layer check: validates the cookie token against the database on every call. */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const email = configuredEmail();
  if (!email) return null;
  const token = (await cookies()).get(cookieName())?.value;
  const session = await findSession(getDatabase(), token);
  if (!session || !sameText(session.email, email)) return null;
  return session;
});

export const requireAdmin = async (): Promise<AdminSession> => {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  return session;
};

export const startAdminSession = async (email: string): Promise<void> => {
  const { token, expiresAt } = await createSession(getDatabase(), email);
  (await cookies()).set(cookieName(), token, {
    httpOnly: true,
    secure: isSecureSite(getServerEnv().SITE_URL),
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
    priority: 'high',
  });
};

export const endAdminSession = async (): Promise<void> => {
  const store = await cookies();
  await deleteSession(getDatabase(), store.get(cookieName())?.value);
  store.delete(cookieName());
};
