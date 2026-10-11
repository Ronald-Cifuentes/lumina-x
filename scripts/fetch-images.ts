import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import sharp from 'sharp';
import { allCatalogImages, type CatalogImage, unsplashSourceUrl } from '../src/content/images/catalog';
import type { ImageManifest, ManifestEntry } from '../src/content/images/types';

const root = process.cwd();
const manifestPath = join(root, 'src/content/images/manifest.json');
const publicPath = (image: CatalogImage) => `/images/${image.group}/${image.key}.webp`;

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function readManifest(): Promise<ImageManifest> {
  if (!(await exists(manifestPath))) return {};
  return JSON.parse(await readFile(manifestPath, 'utf8')) as ImageManifest;
}

async function download(image: CatalogImage): Promise<Buffer> {
  const url = `${unsplashSourceUrl(image.unsplashId)}?w=${image.width}&q=85&fm=jpg`;
  const response = await fetch(url);
  const type = response.headers.get('content-type') ?? '';
  if (!response.ok || !type.startsWith('image/')) {
    throw new Error(`No se pudo descargar ${image.key} (${response.status}) desde ${url}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function describe(file: string, image: CatalogImage): Promise<ManifestEntry> {
  const pipeline = sharp(file);
  const { width, height } = await pipeline.metadata();
  if (!width || !height) throw new Error(`Imagen sin dimensiones: ${image.key}`);
  const blur = await sharp(file).resize(16).webp({ quality: 40 }).toBuffer();
  return {
    src: publicPath(image),
    width,
    height,
    blurDataURL: `data:image/webp;base64,${blur.toString('base64')}`,
    sourceUrl: unsplashSourceUrl(image.unsplashId),
  };
}

async function main() {
  const manifest = await readManifest();
  const next: ImageManifest = {};
  let downloaded = 0;

  for (const image of allCatalogImages) {
    const file = join(root, 'public', publicPath(image));
    if (!(await exists(file))) {
      await mkdir(dirname(file), { recursive: true });
      const original = await download(image);
      await sharp(original)
        .rotate()
        .resize({ width: image.width, withoutEnlargement: true })
        .webp({ quality: 78, effort: 5 })
        .toFile(file);
      downloaded += 1;
    }
    const known = manifest[image.key];
    next[image.key] = known && known.src === publicPath(image) ? known : await describe(file, image);
  }

  const sorted = Object.fromEntries(Object.entries(next).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(manifestPath, `${JSON.stringify(sorted, null, 2)}\n`);

  const openGraph = join(root, 'public/images/site/og.jpg');
  if (!(await exists(openGraph))) {
    await sharp(join(root, 'public/images/site/hero.webp'))
      .resize(1200, 630, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(openGraph);
  }
  console.log(`Imágenes: ${allCatalogImages.length} en catálogo, ${downloaded} descargadas.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
