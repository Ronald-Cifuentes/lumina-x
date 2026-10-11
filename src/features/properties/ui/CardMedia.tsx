'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import type { PropertyImage as PropertyImageData } from '../domain';
import { PropertyImage } from './PropertyImage';

type CardMediaProps = {
  cover: PropertyImageData;
  secondary: PropertyImageData | null;
  sizes: string;
  preload?: boolean;
};

/**
 * The second photograph is requested only after the first hover or focus,
 * then cross-fades in while the cover drifts slightly.
 */
export function CardMedia({ cover, secondary, sizes, preload }: CardMediaProps) {
  const [requested, setRequested] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="absolute inset-0" onPointerEnter={() => setRequested(true)} onFocus={() => setRequested(true)}>
      <PropertyImage
        image={cover}
        sizes={sizes}
        preload={preload}
        className="transition-transform duration-[1400ms] ease-[var(--ease-editorial)] motion-safe:group-hover:scale-[1.045]"
      />
      {secondary && requested && (
        <Image
          src={secondary.src}
          alt=""
          aria-hidden="true"
          fill
          sizes={sizes}
          onLoad={() => setLoaded(true)}
          className={cn(
            'object-cover opacity-0 transition-opacity duration-700 ease-[var(--ease-editorial)]',
            loaded && 'group-hover:opacity-100 group-focus-within:opacity-100',
          )}
        />
      )}
    </div>
  );
}
