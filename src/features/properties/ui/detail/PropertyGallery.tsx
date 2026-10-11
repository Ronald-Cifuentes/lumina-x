'use client';

import { ArrowLeft, ArrowRight, Expand, X } from 'lucide-react';
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { cn } from '@/shared/lib/cn';
import type { PropertyImage as PropertyImageData } from '../../domain';
import { PropertyImage } from '../PropertyImage';

type PropertyGalleryProps = { images: PropertyImageData[]; name: string };

const SWIPE_THRESHOLD = 48;

const mosaicCell = (index: number, total: number) => {
  if (index === 0) return 'md:col-span-2 md:row-span-2';
  if (total === 4 && index === 3) return 'md:col-span-2';
  return '';
};

/**
 * Editorial mosaic (desktop) and swipeable strip (mobile). Every photograph
 * opens a native modal <dialog> lightbox with keyboard, button and swipe
 * navigation; focus returns to the photograph that opened it.
 */
export function PropertyGallery({ images, name }: PropertyGalleryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const pointerStart = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const total = images.length;
  const current = images[index] ?? images[0];

  const open = (target: number, opener: HTMLElement) => {
    openerRef.current = opener;
    setIndex(target);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const go = (delta: number) => setIndex((value) => (value + delta + total) % total);

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(-1);
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    pointerStart.current = event.clientX;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (pointerStart.current === null) return;
    const delta = event.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(delta) > SWIPE_THRESHOLD) go(delta < 0 ? 1 : -1);
  };

  if (!current) return null;

  return (
    <div data-testid="property-gallery">
      <div className="relative">
        <ul className="-mx-[max(1.25rem,4vw)] flex snap-x snap-mandatory gap-2 overflow-x-auto px-[max(1.25rem,4vw)] [scrollbar-width:none] md:mx-0 md:grid md:h-[min(72vh,720px)] md:snap-none md:grid-cols-4 md:grid-rows-2 md:overflow-visible md:px-0">
          {images.map((image, imageIndex) => (
            <li
              key={image.src}
              className={cn('w-[86vw] shrink-0 snap-center md:w-auto', mosaicCell(imageIndex, total), imageIndex >= 5 && 'md:hidden')}
            >
              <button
                type="button"
                onClick={(event) => open(imageIndex, event.currentTarget)}
                className="group relative block aspect-[4/3] w-full overflow-hidden bg-ivory-deep md:aspect-auto md:h-full"
                aria-label={`Ampliar fotografía ${imageIndex + 1} de ${total}: ${image.alt}`}
              >
                <PropertyImage
                  image={image}
                  preload={imageIndex === 0}
                  sizes={imageIndex === 0 ? '(min-width: 768px) 50vw, 86vw' : '(min-width: 768px) 25vw, 86vw'}
                  className="transition-transform duration-[1200ms] ease-[var(--ease-editorial)] motion-safe:group-hover:scale-[1.03]"
                />
                <span className="absolute bottom-3 right-3 bg-charcoal/70 px-2 py-1 text-[0.6875rem] text-ivory md:hidden">
                  {imageIndex + 1} / {total}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={(event) => open(0, event.currentTarget)}
          className="absolute bottom-4 right-4 hidden items-center gap-2 bg-surface px-4 py-2.5 text-[0.75rem] font-semibold uppercase tracking-[0.14em] shadow-sm hover:bg-ivory md:inline-flex"
        >
          <Expand aria-hidden="true" className="size-4" strokeWidth={1.6} />
          Ver las {total} fotografías
        </button>
        <span className="pointer-events-none absolute bottom-4 left-4 hidden bg-charcoal/70 px-2.5 py-1 text-[0.6875rem] tracking-[0.12em] text-ivory md:inline">
          Imágenes ilustrativas
        </span>
      </div>
      <p className="mt-2 text-xs text-ink-muted md:hidden">Imágenes ilustrativas · Desliza para ver más</p>

      <dialog
        ref={dialogRef}
        aria-label={`Galería de ${name}`}
        onKeyDown={onKeyDown}
        onClose={() => openerRef.current?.focus()}
        className="on-dark m-0 h-dvh max-h-none w-full max-w-none bg-charcoal p-0 text-ivory backdrop:bg-charcoal"
        data-testid="lightbox"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-4 sm:px-8">
            <p className="font-serif text-xl tabular-nums" aria-live="polite" data-testid="lightbox-counter">
              {String(index + 1).padStart(2, '0')} <span className="text-ivory/50">/ {String(total).padStart(2, '0')}</span>
            </p>
            <button
              type="button"
              onClick={close}
              className="inline-flex size-11 items-center justify-center rounded-full border border-ivory/30 hover:border-ivory"
            >
              <X aria-hidden="true" className="size-5" strokeWidth={1.6} />
              <span className="sr-only">Cerrar galería</span>
            </button>
          </div>

          <div
            className="relative flex-1 touch-pan-y select-none"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              pointerStart.current = null;
            }}
          >
            <PropertyImage key={current.src} image={current} sizes="100vw" objectFit="contain" className="p-2 sm:p-6" />
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-charcoal/60 hover:bg-charcoal sm:left-6"
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
              <span className="sr-only">Fotografía anterior</span>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-charcoal/60 hover:bg-charcoal sm:right-6"
            >
              <ArrowRight aria-hidden="true" className="size-5" />
              <span className="sr-only">Fotografía siguiente</span>
            </button>
          </div>

          <p className="px-5 pb-6 pt-3 text-center text-sm text-ivory/75 sm:px-8">
            {current.alt} · <span className="text-ivory/55">Imagen ilustrativa, no corresponde al inmueble</span>
          </p>
        </div>
      </dialog>
    </div>
  );
}
