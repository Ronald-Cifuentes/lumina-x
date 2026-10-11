import 'server-only';
import { createHash } from 'node:crypto';
import { headers } from 'next/headers';

/**
 * Anonymous, hashed identifier of the requesting client for rate limiting.
 *
 * Next.js fills `x-forwarded-for` with the socket address only when the
 * header is missing, so without a trusted proxy that overwrites it a client
 * can spoof this value. The global per-form ceiling in the lead service
 * bounds abuse in that case; behind Vercel or another trusted proxy the
 * header is reliable.
 */
export const getClientKey = async (): Promise<string> => {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = requestHeaders.get('x-real-ip')?.trim();
  const address = forwarded || realIp || 'unknown';
  return createHash('sha256').update(address).digest('hex').slice(0, 32);
};
