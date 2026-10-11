export type ManifestEntry = {
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
  sourceUrl: string;
};

export type ImageManifest = Record<string, ManifestEntry>;
