import { randomBytes } from 'node:crypto';
import { hashPassword } from '../src/features/admin/password';

const MIN_LENGTH = 12;

async function main() {
  // pnpm forwards a literal `--` (`pnpm admin:hash -- "…"`); it is a separator, never the password.
  const [argument] = process.argv.slice(2).filter((arg) => arg !== '--');
  const generated = !argument || argument === '--generate';
  const password = generated ? randomBytes(18).toString('base64url') : argument;

  if (password.length < MIN_LENGTH) {
    console.error(`La contraseña debe tener al menos ${MIN_LENGTH} caracteres.`);
    process.exit(1);
  }

  const hash = await hashPassword(password);
  if (generated) console.info(`Contraseña generada (guárdala en un gestor seguro): ${password}`);
  console.info('Agrega esta línea a tu archivo .env.local o a las variables del entorno de despliegue:');
  console.info(`ADMIN_PASSWORD_HASH=${hash}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
