import { createHash, randomBytes } from 'node:crypto';
import { eq, lt } from 'drizzle-orm';
import type { Database } from '@/db/client';
import { adminSessions } from '@/db/schema';

export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');

export type AdminSession = { email: string; expiresAt: Date };

/** The cookie keeps a random token; the database only stores its SHA-256. */
export const createSession = async (db: Database, email: string, now = new Date()) => {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, now));
  await db.insert(adminSessions).values({ id: hashToken(token), email, expiresAt, createdAt: now });
  return { token, expiresAt };
};

export const findSession = async (
  db: Database,
  token: string | undefined,
  now = new Date(),
): Promise<AdminSession | null> => {
  if (!token || token.length < 32 || token.length > 128) return null;
  const id = hashToken(token);
  const [session] = await db.select().from(adminSessions).where(eq(adminSessions.id, id)).limit(1);
  if (!session) return null;
  if (session.expiresAt.getTime() <= now.getTime()) {
    await db.delete(adminSessions).where(eq(adminSessions.id, id));
    return null;
  }
  return { email: session.email, expiresAt: session.expiresAt };
};

export const deleteSession = async (db: Database, token: string | undefined): Promise<void> => {
  if (!token) return;
  await db.delete(adminSessions).where(eq(adminSessions.id, hashToken(token)));
};
