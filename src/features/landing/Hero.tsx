'use client';

import { ArrowDown, ArrowRight } from 'lucide-react';
import { useScroll } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { ParallaxMedia } from '@/features/motion/ParallaxMedia';
import type { PropertyImage } from '@/features/properties/domain';
import { HeroSearch } from './HeroSearch';

type HeroProps = {
  background: PropertyImage;
  fragment: PropertyImage;
  totalProperties: number;
};

/**
 * Three depth planes driven by the hero's own scroll progress:
 * photograph (-45px), translucent architectural fragment (-110px) and
 * foreground copy with the search panel (-20px).
 */
export function Hero({ background, fragment, totalProperties }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-title"
      className="on-dark relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-charcoal text-ivory lg:min-h-[94svh]"
    >
      <ParallaxMedia
        progress={scrollYProgress}
        range={[0, -45]}
        plane="background"
        className="absolute inset-x-0 -bottom-16 top-0 -z-20"
      >
        <Image
          src={background.src}
          alt={background.alt}
          fill
          preload
          sizes="100vw"
          quality={75}
          placeholder="blur"
          blurDataURL={background.blurDataURL}
          className="object-cover object-[62%_center]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgb(32_35_31/0.5)_0%,rgb(32_35_31/0.08)_30%,rgb(32_35_31/0.3)_62%,rgb(32_35_31/0.88)_100%)]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgb(32_35_31/0.55)_0%,transparent_58%)]" />
        <div aria-hidden="true" className="absolute inset-0 bg-charcoal/35 lg:hidden" />
      </ParallaxMedia>

      <ParallaxMedia
        progress={scrollYProgress}
        range={[0, -110]}
        smooth
        plane="fragment"
        className="pointer-events-none absolute right-[6vw] top-[14svh] -z-10 hidden w-[min(18vw,290px)] md:block"
      >
        <figure className="relative aspect-[3/4] overflow-hidden border border-ivory/40 bg-ivory/10 shadow-[0_50px_90px_-50px_rgb(0_0_0/0.8)] backdrop-blur-[3px]">
          <Image
            src={fragment.src}
            alt=""
            fill
            sizes="18vw"
            quality={60}
            className="object-cover opacity-70 mix-blend-luminosity"
          />
          <div aria-hidden="true" className="absolute inset-3 border border-ivory/30" />
          <figcaption className="absolute inset-x-5 bottom-5 flex items-end justify-between text-ivory/90">
            <span className="eyebrow">Fig. 01</span>
            <span className="max-w-[9rem] text-right font-serif text-base italic leading-tight">Celosía, sombra y luz filtrada</span>
          </figcaption>
        </figure>
      </ParallaxMedia>

      <ParallaxMedia
        progress={scrollYProgress}
        range={[0, -20]}
        plane="foreground"
        className="shell relative flex flex-1 flex-col justify-end pb-24 pt-32 sm:pt-40 lg:pb-28"
      >
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <p className="eyebrow text-ivory/80">
              Arriendos curados · Medellín y Valle de Aburrá · {totalProperties} residencias
            </p>
            <h1 id="hero-title" className="display mt-6 text-balance text-[clamp(2.85rem,6.9vw,7rem)] font-light leading-[0.92]">
              No buscas un inmueble.{' '}
              <span className="block text-balance italic text-bronze-light">Buscas cómo quieres vivir.</span>
            </h1>
            <p className="mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-ivory/85">
              Apartamentos, casas, apartaestudios y lofts en arriendo, seleccionados uno a uno en Medellín, Envigado,
              Sabaneta e Itagüí: arquitectura con buena luz, materiales honestos y barrios que se disfrutan a pie.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                href="/propiedades"
                className="group inline-flex items-center gap-4 bg-ivory px-6 py-4 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-charcoal transition-colors hover:bg-surface"
              >
                Explorar propiedades
                <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 border-b border-ivory/50 pb-1 text-[0.8125rem] font-medium tracking-[0.06em] transition-colors hover:border-ivory"
              >
                Agenda una asesoría
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 xl:col-span-5">
            <HeroSearch />
          </div>
        </div>
      </ParallaxMedia>

      <a
        href="#historia"
        className="group absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-ivory/80 transition-colors hover:text-ivory"
      >
        <span className="eyebrow">Desliza</span>
        <span aria-hidden="true" className="relative h-10 w-px overflow-hidden bg-ivory/25">
          <span data-testid="scroll-cue-line" className="absolute inset-0 bg-ivory motion-safe:animate-scroll-cue" />
        </span>
        <ArrowDown aria-hidden="true" className="size-3.5" strokeWidth={1.6} />
        <span className="sr-only">Ir a la siguiente sección</span>
      </a>
    </section>
  );
}
