import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ImageReveal } from '@/features/motion/ImageReveal';
import { MUNICIPALITY_LABELS, type PropertyCardData } from '@/features/properties/domain';
import { PropertyImage } from '@/features/properties/ui/PropertyImage';
import { cn } from '@/shared/lib/cn';
import { formatCOP } from '@/shared/lib/format';
import { SectionHeading } from '@/shared/ui/SectionHeading';

/** Alternating large and compact frames on a 12-column grid. */
const LAYOUT = [
  { item: 'lg:col-span-7', frame: 'aspect-[5/4]', sizes: '(min-width: 1024px) 56vw, 100vw' },
  { item: 'lg:col-span-4 lg:col-start-9 lg:mt-40', frame: 'aspect-[3/4]', sizes: '(min-width: 1024px) 31vw, 100vw' },
  { item: 'lg:col-span-4 lg:col-start-2 lg:-mt-8', frame: 'aspect-[3/4]', sizes: '(min-width: 1024px) 31vw, 100vw' },
  { item: 'lg:col-span-6 lg:col-start-7 lg:mt-24', frame: 'aspect-[4/3]', sizes: '(min-width: 1024px) 48vw, 100vw' },
  { item: 'lg:col-span-5', frame: 'aspect-[4/5]', sizes: '(min-width: 1024px) 40vw, 100vw' },
  { item: 'lg:col-span-5 lg:col-start-8 lg:mt-36', frame: 'aspect-square', sizes: '(min-width: 1024px) 40vw, 100vw' },
] as const;

export function FeaturedResidences({ properties, total }: { properties: PropertyCardData[]; total: number }) {
  return (
    <section aria-labelledby="destacadas-title" className="bg-surface py-28 sm:py-36">
      <div className="shell">
        <SectionHeading number="02" eyebrow="Residencias destacadas" />
        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2 id="destacadas-title" className="display text-[clamp(2.5rem,5.4vw,5.25rem)] font-light lg:col-span-7">
            Seis casas para mirar con calma.
          </h2>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="text-[1.0625rem] leading-relaxed text-ink-muted">
              Una selección del portafolio con distintas escalas y presupuestos. Cada una tiene su propia ficha, galería y
              formulario de visita.
            </p>
            <Link
              prefetch={false}
              href="/propiedades"
              className="group mt-6 inline-flex items-center gap-3 border-b border-charcoal pb-1 text-[0.8125rem] font-semibold uppercase tracking-[0.14em]"
            >
              Ver las {total} residencias
              <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <ol className="mt-20 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-12 lg:gap-y-24">
          {properties.map((property, index) => {
            const layout = LAYOUT[index % LAYOUT.length] ?? LAYOUT[0];
            return (
              <li key={property.id} className={cn(layout.item)} data-testid="featured-item">
                <Link prefetch={false} href={`/propiedades/${property.slug}`} className="group block">
                  <ImageReveal className={cn('w-full bg-ivory-deep', layout.frame)} delay={0.05}>
                    <PropertyImage
                      image={property.cover}
                      sizes={layout.sizes}
                      className="transition-transform duration-[1400ms] ease-[var(--ease-editorial)] motion-safe:group-hover:scale-[1.035]"
                    />
                  </ImageReveal>
                  <div className="mt-5 flex items-start gap-5">
                    <span aria-hidden="true" className="display text-[2.75rem] font-light leading-none text-bronze">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1 border-t border-line pt-3">
                      <h3 className="font-serif text-[1.75rem] leading-tight decoration-bronze decoration-1 underline-offset-[6px] group-hover:underline">
                        {property.name}
                      </h3>
                      <p className="mt-1 text-sm text-ink-muted">
                        {property.neighborhood}, {MUNICIPALITY_LABELS[property.municipality]} · {property.areaM2} m² ·{' '}
                        {formatCOP(property.monthlyRent)}/mes
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
