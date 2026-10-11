'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import type { PropertyImage as PropertyImageData } from '../domain';
import { ImageFallback } from './ImageFallback';

type PropertyImageProps = {
  image: PropertyImageData;
  sizes: string;
  className?: string;
  preload?: boolean;
  quality?: 60 | 75;
  decorative?: boolean;
  objectFit?: 'cover' | 'contain';
};

/** next/image with a blur placeholder and a designed fallback when the file fails to load. */
export function PropertyImage({
  image,
  sizes,
  className,
  preload = false,
  quality = 75,
  decorative = false,
  objectFit = 'cover',
}: PropertyImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return <ImageFallback label={image.alt} />;
  return (
    <Image
      src={image.src}
      alt={decorative ? '' : image.alt}
      fill
      sizes={sizes}
      quality={quality}
      preload={preload}
      placeholder="blur"
      blurDataURL={image.blurDataURL}
      onError={() => setFailed(true)}
      ref={(element) => {
        if (element?.complete && element.naturalWidth === 0 && element.currentSrc) setFailed(true);
      }}
      className={cn(objectFit === 'cover' ? 'object-cover' : 'object-contain', className)}
    />
  );
}
