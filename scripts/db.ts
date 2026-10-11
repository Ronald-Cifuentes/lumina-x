import './env';
import { rm, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { isNotNull, sql } from 'drizzle-orm';
import { createDatabase, DEFAULT_DATABASE_URL } from '../src/db/client';
import { countProperties, runMigrations, seedProperties } from '../src/db/maintenance';
import { properties } from '../src/db/schema';

const EXPECTED_PROPERTIES = 50;
const url = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;
const [command = 'setup', ...flags] = process.argv.slice(2);

const describeTarget = () => (url.startsWith('file:') ? url : url.replace(/\/\/.*@/, '//***@'));

async function removeLocalDatabase() {
  if (!url.startsWith('file:')) {
    throw new Error('db:reset solo borra bases SQLite locales (file:). Usa pnpm db:seed --reset en remoto.');
  }
  const path = resolve(url.slice('file:'.length));
  await Promise.all(['', '-wal', '-shm', '-journal'].map((suffix) => rm(`${path}${suffix}`, { force: true })));
}

async function verify() {
  const db = createDatabase(url, authToken);
  const rows = await db
    .select({ slug: properties.slug, images: properties.images, published: properties.published })
    .from(properties);
  const failures: string[] = [];
  const slugs = new Set(rows.map((row) => row.slug));
  if (rows.length !== EXPECTED_PROPERTIES) failures.push(`Se esperaban ${EXPECTED_PROPERTIES} propiedades y hay ${rows.length}.`);
  if (slugs.size !== rows.length) failures.push('Hay slugs duplicados.');
  const covers = new Set(rows.map((row) => row.images[0]?.src));
  if (covers.size !== rows.length) failures.push('Las portadas no son únicas.');
  for (const row of rows) {
    if (row.images.length < 4) failures.push(`${row.slug}: menos de 4 imágenes.`);
    for (const image of row.images) {
      try {
        const file = await stat(join(process.cwd(), 'public', image.src));
        if (file.size === 0) failures.push(`${row.slug}: imagen vacía ${image.src}`);
      } catch {
        failures.push(`${row.slug}: no existe ${image.src}`);
      }
    }
  }
  const [{ total } = { total: 0 }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(properties)
    .where(isNotNull(properties.administrationFee));
  console.info(
    `Base ${describeTarget()}: ${rows.length} propiedades, ${slugs.size} slugs únicos, ${covers.size} portadas únicas, ${total} con administración.`,
  );
  if (failures.length > 0) {
    failures.forEach((failure) => console.error(`✗ ${failure}`));
    process.exit(1);
  }
  console.info('✓ Verificación de datos superada.');
}

async function main() {
  switch (command) {
    case 'migrate': {
      await runMigrations(createDatabase(url, authToken));
      console.info(`✓ Migraciones aplicadas en ${describeTarget()}`);
      return;
    }
    case 'setup':
    case 'seed': {
      const db = createDatabase(url, authToken);
      await runMigrations(db);
      const result = await seedProperties(db, { reset: flags.includes('--reset') });
      console.info(
        `✓ Seed en ${describeTarget()}: ${result.inserted} nuevas, ${result.after} en total (catálogo canónico: ${result.canonical}).`,
      );
      return;
    }
    case 'reset': {
      await removeLocalDatabase();
      const db = createDatabase(url, authToken);
      await runMigrations(db);
      const result = await seedProperties(db);
      console.info(`✓ Base recreada en ${describeTarget()} con ${await countProperties(db)} propiedades (${result.inserted} insertadas).`);
      return;
    }
    case 'verify':
      await verify();
      return;
    default:
      throw new Error(`Comando desconocido: ${command}. Usa migrate | seed [--reset] | reset | verify.`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
