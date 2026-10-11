import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { FavoriteButton } from '@/features/favorites/FavoriteButton';
import { cn } from '@/shared/lib/cn';
import { formatArea, formatCOP, propertyReference } from '@/shared/lib/format';
import { MUNICIPALITY_LABELS, PROPERTY_TYPE_LABELS, type PropertyCardData, ZONE_LABELS } from '../domain';
import { AvailabilityBadge } from './AvailabilityBadge';
import { CardMedia } from './CardMedia';

export const CARD_SIZES = '(min-width: 1280px) 27vw, (min-width: 768px) 46vw, 92vw';

type PropertyCardProps = {
  property: PropertyCardData;
  sizes?: string;
  preload?: boolean;
  headingLevel?: 'h2' | 'h3';
  className?: string;
};

export function PropertyCard({ property, sizes = CARD_SIZES, preload, headingLevel = 'h3', className }: PropertyCardProps) {
  const Heading = headingLevel;
  const location =
    ZONE_LABELS[property.zone] === MUNICIPALITY_LABELS[property.municipality]
      ? MUNICIPALITY_LABELS[property.municipality]
      : `${ZONE_LABELS[property.zone]}, ${MUNICIPALITY_LABELS[property.municipality]}`;

  return (
    <article className={cn('group relative flex h-full flex-col', className)} data-testid="property-card" data-slug={property.slug}>
      <div className="relative aspect-[4/5] overflow-hidden bg-ivory-deep">
        <CardMedia cover={property.cover} secondary={property.secondary} sizes={sizes} preload={preload} />
        <AvailabilityBadge availability={property.availability} className="absolute left-3 top-3" />
        <FavoriteButton slug={property.slug} name={property.name} className="absolute right-3 top-3" />
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <p className="eyebrow text-bronze-deep">
          {PROPERTY_TYPE_LABELS[property.type]} · {location}
        </p>
        <Heading className="mt-2 font-serif text-[1.65rem] leading-[1.1]">
          <Link
            prefetch={false}
            href={`/propiedades/${property.slug}`}
            className="flex items-start justify-between gap-3 after:absolute after:inset-0 after:z-[1] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-bronze-deep"
          >
            <span className="transition-transform duration-500 ease-[var(--ease-editorial)] motion-safe:group-hover:translate-x-1">
              {property.name}
            </span>
            <ArrowUpRight
              aria-hidden="true"
              strokeWidth={1.4}
              className="mt-1 size-5 shrink-0 text-bronze transition-transform duration-500 ease-[var(--ease-editorial)] motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
            />
          </Link>
        </Heading>
        <p className="mt-1.5 text-sm text-ink-muted">{property.neighborhood}</p>

        <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-line pt-4 text-[0.8125rem] text-ink-muted">
          <div>
            <dt className="sr-only">Área</dt>
            <dd>{formatArea(property.areaM2)}</dd>
          </div>
          <div>
            <dt className="sr-only">Habitaciones</dt>
            <dd>
              {property.bedrooms} {property.bedrooms === 1 ? 'hab.' : 'habs.'}
            </dd>
          </div>
          <div>
            <dt className="sr-only">Baños</dt>
            <dd>
              {property.bathrooms} {property.bathrooms === 1 ? 'baño' : 'baños'}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p>
            <span className="sr-only">Canon mensual: </span>
            <span className="text-lg font-semibold tracking-tight text-charcoal" data-testid="card-rent" data-value={property.monthlyRent}>
              {formatCOP(property.monthlyRent)}
            </span>
            <span className="text-xs text-ink-muted"> /mes</span>
          </p>
          <p className="text-xs text-ink-muted">
            {property.administrationFee ? `Adm. ${formatCOP(property.administrationFee)}` : 'Sin administración'}
          </p>
        </div>
        <p className="mt-3 text-[0.6875rem] tracking-[0.12em] text-ink-muted">Ref. {propertyReference(property.id)}</p>
      </div>
    </article>
  );
}
