import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const COST = 16_384;
const BLOCK_SIZE = 8;
const PARALLELISM = 1;
const KEY_LENGTH = 64;
const MAX_MEMORY = 64 * 1024 * 1024;

const derive = (password: string, salt: Buffer, cost: number, blockSize: number, parallelism: number) =>
  new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password.normalize('NFKC'),
      salt,
      KEY_LENGTH,
      { N: cost, r: blockSize, p: parallelism, maxmem: MAX_MEMORY },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });

/** Format: `scrypt:N:r:p:salt:hash` (base64url). Colons avoid `$` expansion in .env files. */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16);
  const key = await derive(password, salt, COST, BLOCK_SIZE, PARALLELISM);
  return ['scrypt', COST, BLOCK_SIZE, PARALLELISM, salt.toString('base64url'), key.toString('base64url')].join(':');
};

export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  const [scheme, cost, blockSize, parallelism, salt, hash] = stored.split(':');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const params = [cost, blockSize, parallelism].map(Number);
  if (params.some((value) => !Number.isInteger(value) || value <= 0)) return false;
  const [n = 0, r = 0, p = 0] = params;
  const expected = Buffer.from(hash, 'base64url');
  if (expected.length !== KEY_LENGTH) return false;
  try {
    const actual = await derive(password, Buffer.from(salt, 'base64url'), n, r, p);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
};
