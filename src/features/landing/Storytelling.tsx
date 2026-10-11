'use client';

import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { useState } from 'react';
import { EDITORIAL_EASE } from '@/features/motion/easing';
import { ParallaxMedia } from '@/features/motion/ParallaxMedia';
import { RevealText } from '@/features/motion/RevealText';
import type { PropertyImage } from '@/features/properties/domain';
import { cn } from '@/shared/lib/cn';
import { SectionHeading } from '@/shared/ui/SectionHeading';

type Step = { id: string; number: string; title: string; text: string; image: PropertyImage };

const COPY = [
  {
    id: 'luz',
    number: '01',
    title: 'La luz organiza el día',
    text: 'Priorizamos ventanales bien orientados, dobles alturas y patios. Cada ficha cuenta hacia dónde mira la sala y cómo entra el sol, porque eso decide cómo se vive una casa a las siete de la mañana.',
  },
  {
    id: 'materia',
    number: '02',
    title: 'Materiales que envejecen bien',
    text: 'Ladrillo, madera, concreto a la vista y celosías que filtran el calor. Buscamos espacios con materiales nobles, de mantenimiento sencillo, que ganan carácter con los años en lugar de perderlo.',
  },
  {
    id: 'entorno',
    number: '03',
    title: 'El barrio también es la casa',
    text: 'Parques, comercio de cercanía, transporte y tiempos reales de desplazamiento. Una buena dirección no se mide en metros cuadrados sino en lo que puedes hacer a pie al salir de la puerta.',
  },
] as const;

/**
 * Sticky photograph on large screens: as each description reaches the middle
 * of the viewport, the next image is revealed with a clip-path wipe. On small
 * screens every step carries its own image, with no sticky behaviour.
 */
export function Storytelling({ images }: { images: readonly [PropertyImage, PropertyImage, PropertyImage] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const steps: Step[] = COPY.map((copy, index) => ({ ...copy, image: images[index] as PropertyImage }));

  return (
    <section id="historia" aria-labelledby="historia-title" className="relative bg-ivory pb-24 pt-28 sm:pb-32 sm:pt-36">
      <div className="shell">
        <SectionHeading number="01" eyebrow="Arquitectura cotidiana" />
        <RevealText
          as="h2"
          id="historia-title"
          text="Espacios que transforman lo cotidiano."
          className="display mt-10 max-w-5xl text-[clamp(2.6rem,6.2vw,6.25rem)] font-light"
        />
      </div>

      <div className="shell mt-16 lg:mt-24 lg:grid lg:grid-cols-12">
        <div className="hidden lg:col-span-7 lg:block">
          <div className="sticky top-24 h-[calc(100svh-8rem)]">
            <figure className="relative h-full overflow-hidden bg-ivory-deep" data-testid="story-sticky">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className="absolute inset-0"
                  initial={false}
                  animate={{ clipPath: index <= active ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)' }}
                  transition={{ duration: reduce ? 0 : 1.05, ease: EDITORIAL_EASE }}
                >
                  <ParallaxMedia range={[24, -24]} className="absolute -inset-y-8 inset-x-0">
                    <Image
                      src={step.image.src}
                      alt={step.image.alt}
                      fill
                      sizes="(min-width: 1024px) 56vw, 100vw"
                      placeholder="blur"
                      blurDataURL={step.image.blurDataURL}
                      className="object-cover"
                    />
                  </ParallaxMedia>
                </motion.div>
              ))}
              <figcaption className="absolute bottom-0 left-0 flex items-baseline gap-4 bg-ivory px-6 py-4">
                <span className="display text-3xl text-bronze">{steps[active]?.number}</span>
                <span className="eyebrow text-charcoal">{steps[active]?.title}</span>
              </figcaption>
            </figure>
          </div>
        </div>

        <ol className="lg:col-span-4 lg:col-start-9">
          {steps.map((step, index) => (
            <motion.li
              key={step.id}
              onViewportEnter={() => setActive(index)}
              viewport={{ amount: 0.55 }}
              className={cn(
                'relative border-t border-line py-12 first:border-t-0 lg:flex lg:min-h-[78svh] lg:flex-col lg:justify-center lg:border-t-0 lg:py-0',
              )}
            >
              <div className="relative mb-8 aspect-[4/3] overflow-hidden lg:hidden">
                <Image
                  src={step.image.src}
                  alt={step.image.alt}
                  fill
                  sizes="100vw"
                  placeholder="blur"
                  blurDataURL={step.image.blurDataURL}
                  className="object-cover"
                />
              </div>
              <span
                aria-hidden="true"
                data-numeral={step.number}
                className={cn(
                  'display pointer-events-none block select-none text-[6.5rem] font-light leading-none transition-colors duration-700 before:content-[attr(data-numeral)] lg:absolute lg:-left-36 lg:top-1/2 lg:-translate-y-[120%] lg:text-[10rem]',
                  active === index ? 'text-bronze/80' : 'text-bronze/25',
                )}
              />
              <h3 className="font-serif text-[2.1rem] leading-tight sm:text-[2.5rem]">{step.title}</h3>
              <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-ink-muted">{step.text}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
