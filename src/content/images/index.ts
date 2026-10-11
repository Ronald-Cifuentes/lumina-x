import type { PropertyImage } from '../../features/properties/domain';
import { allCatalogImages } from './catalog';
import manifestJson from './manifest.json';
import type { ImageManifest } from './types';

const manifest: ImageManifest = manifestJson;
const altByKey = new Map(allCatalogImages.map((image) => [image.key, image.alt]));

export const getCatalogImage = (key: string): PropertyImage => {
  const entry = manifest[key];
  const alt = altByKey.get(key);
  if (!entry || !alt) {
    throw new Error(`Imagen desconocida: "${key}". Ejecuta pnpm images:fetch.`);
  }
  return {
    src: entry.src,
    alt,
    width: entry.width,
    height: entry.height,
    blurDataURL: entry.blurDataURL,
  };
};

export const imageManifest = manifest;
