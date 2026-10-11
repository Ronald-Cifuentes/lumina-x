'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import { type ReactNode, useRef, useState } from 'react';

export type CarouselItem = { id: string; node: ReactNode };

type EditorialCarouselProps = {
  id: string;
  eyebrow: string;
  title: string;
  items: CarouselItem[];
};

/**
 * Horizontal, scroll-snapped strip: native touch and trackpad scrolling, a
 * focusable track for arrow keys, explicit previous/next buttons and a
 * progress rule tied to the real scroll position.
 */
export function EditorialCarousel({ id, eyebrow, title, items }: EditorialCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const reduce = useReducedMotion();
  const { scrollXProgress } = useScroll({ container: trackRef });
  const [progress, setProgress] = useState(0);

  useMotionValueEvent(scrollXProgress, 'change', (value) => setProgress(value));

  const current = Math.min(items.length, Math.round(progress * (items.length - 1)) + 1);
  const atStart = progress <= 0.001;
  const atEnd = progress >= 0.999;

  const step = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const first = track.querySelector('li');
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const distance = first ? first.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * distance, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <section aria-labelledby={`${id}-title`} aria-roledescription="carrusel" className="py-16 sm:py-20" data-testid="editorial-carousel">
      <div className="shell flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-bronze-deep">{eyebrow}</p>
          <h2 id={`${id}-title`} className="display mt-4 text-[clamp(2.2rem,4.4vw,3.75rem)] font-light">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-5">
          <p className="font-serif text-xl tabular-nums" aria-live="polite" data-testid="carousel-counter">
            <span className="sr-only">Mostrando </span>
            {String(current).padStart(2, '0')}
            <span className="text-ink-muted"> / {String(items.length).padStart(2, '0')}</span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={atStart}
              aria-controls={`${id}-track`}
              className="inline-flex size-12 items-center justify-center border border-charcoal transition-colors hover:bg-charcoal hover:text-ivory disabled:cursor-not-allowed disabled:border-line-strong disabled:text-ink-muted/50 disabled:hover:bg-transparent"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              <span className="sr-only">Anterior</span>
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={atEnd}
              aria-controls={`${id}-track`}
              className="inline-flex size-12 items-center justify-center border border-charcoal transition-colors hover:bg-charcoal hover:text-ivory disabled:cursor-not-allowed disabled:border-line-strong disabled:text-ink-muted/50 disabled:hover:bg-transparent"
            >
              <ArrowRight aria-hidden="true" className="size-4" />
              <span className="sr-only">Siguiente</span>
            </button>
          </div>
        </div>
      </div>

      <ul
        ref={trackRef}
        id={`${id}-track`}
        tabIndex={0}
        aria-label={`${title}: usa las flechas del teclado o desliza para recorrer`}
        className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain scroll-smooth px-[max(1.25rem,4vw)] pb-8 [scrollbar-width:none] focus-visible:outline-offset-[-2px] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => (
          <li
            key={item.id}
            aria-roledescription="diapositiva"
            aria-label={`${index + 1} de ${items.length}`}
            className="w-[80vw] shrink-0 snap-start scroll-ml-[max(1.25rem,4vw)] sm:w-[44vw] lg:w-[30vw] xl:w-[25rem]"
          >
            {item.node}
          </li>
        ))}
      </ul>

      <div className="shell">
        <div className="relative h-px bg-line">
          <motion.div
            aria-hidden="true"
            data-testid="carousel-progress"
            style={{ scaleX: scrollXProgress }}
            className="absolute inset-0 origin-left bg-charcoal"
          />
        </div>
      </div>
    </section>
  );
}
