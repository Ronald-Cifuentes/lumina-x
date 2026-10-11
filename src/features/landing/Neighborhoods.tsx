import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { PropertyImage as PropertyImageData, Zone } from '@/features/properties/domain';
import { PropertyImage } from '@/features/properties/ui/PropertyImage';
import { SectionHeading } from '@/shared/ui/SectionHeading';

export type NeighborhoodPanel = {
  zone: Zone;
  name: string;
  description: string;
  count: number;
  image: PropertyImageData;
};

export const NEIGHBORHOOD_COPY: Record<'el-poblado' | 'laureles' | 'envigado' | 'sabaneta', string> = {
  'el-poblado': 'Lomas verdes, vida gastronómica y torres con vista sobre todo el valle.',
  laureles: 'Calles circulares, antejardines y una ciudad plana que se recorre a pie.',
  envigado: 'Escala de pueblo en el centro y casas con jardín en la montaña.',
  sabaneta: 'Conjuntos con zonas comunes amplias y un parque que sigue siendo plaza.',
};

/** Four photographic panels; on large screens the hovered or focused panel widens. */
export function Neighborhoods({ panels }: { panels: NeighborhoodPanel[] }) {
  return (
    <section id="ubicaciones" aria-labelledby="ubicaciones-title" className="on-dark scroll-mt-24 bg-charcoal py-28 text-ivory sm:py-36">
      <div className="shell">
        <SectionHeading number="03" eyebrow="Ubicaciones" tone="dark" />
        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2 id="ubicaciones-title" className="display text-[clamp(2.5rem,5.4vw,5.25rem)] font-light lg:col-span-7">
            Cuatro maneras de vivir el valle.
          </h2>
          <p className="text-[1.0625rem] leading-relaxed text-ivory/75 lg:col-span-4 lg:col-start-9">
            Cada barrio cambia el ritmo de la casa. Elige una zona para ver solo las residencias que hay en ella.
          </p>
        </div>

        <ul className="mt-16 flex flex-col gap-3 lg:h-[76svh] lg:min-h-[540px] lg:flex-row">
          {panels.map((panel, index) => (
            <li
              key={panel.zone}
              className="group relative h-[62svh] min-h-[420px] overflow-hidden lg:h-auto lg:min-h-0 lg:flex-1 lg:transition-[flex-grow] lg:duration-700 lg:ease-[var(--ease-editorial)] lg:hover:grow-[1.75] lg:focus-within:grow-[1.75]"
            >
              <Link
                prefetch={false}
                href={`/propiedades?zona=${panel.zone}`}
                className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8"
                data-testid={`zone-panel-${panel.zone}`}
              >
                <PropertyImage
                  image={panel.image}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="transition-transform duration-[1600ms] ease-[var(--ease-editorial)] motion-safe:group-hover:scale-105"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgb(32_35_31/0.85)_100%)]"
                />
                <span className="relative">
                  <span className="eyebrow block text-ivory/80">
                    {String(index + 1).padStart(2, '0')} · {panel.count} {panel.count === 1 ? 'residencia' : 'residencias'}
                  </span>
                  <span className="display mt-3 block text-[clamp(2.6rem,4vw,3.75rem)] font-light">{panel.name}</span>
                  <span className="mt-3 block max-w-xs text-sm leading-relaxed text-ivory/80">{panel.description}</span>
                  <span className="mt-5 inline-flex items-center gap-2 border-b border-ivory/50 pb-1 text-[0.75rem] font-semibold uppercase tracking-[0.16em]">
                    Ver propiedades
                    <ArrowUpRight aria-hidden="true" className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
