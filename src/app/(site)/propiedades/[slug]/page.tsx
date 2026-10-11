import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FavoriteButton } from '@/features/favorites/FavoriteButton';
import { visitDateBounds } from '@/features/leads/schemas';
import {
  DEMO_NOTICE,
  MUNICIPALITY_LABELS,
  PROPERTY_TYPE_LABELS,
  ZONE_LABELS,
} from '@/features/properties/domain';
import { propertyJsonLd } from '@/features/properties/seo';
import { getPropertyBySlug, getSimilarProperties } from '@/features/properties/server/repository';
import { AvailabilityBadge } from '@/features/properties/ui/AvailabilityBadge';
import { ContactPanel } from '@/features/properties/ui/detail/ContactPanel';
import { MobileContactBar } from '@/features/properties/ui/detail/MobileContactBar';
import { KeyFacts, PropertyDisclosures } from '@/features/properties/ui/detail/PropertyDetails';
import { PropertyGallery } from '@/features/properties/ui/detail/PropertyGallery';
import { PropertyCard } from '@/features/properties/ui/PropertyCard';
import { getServerEnv, getSiteUrl } from '@/shared/config/env.server';
import { site } from '@/shared/config/site';
import { cn } from '@/shared/lib/cn';
import { formatCOP, propertyReference } from '@/shared/lib/format';
import { whatsappLink } from '@/shared/lib/whatsapp';
import { pageMetadata, serializeJsonLd } from '@/shared/seo/metadata';

export const dynamic = 'force-dynamic';

const SLUG_PATTERN = /^[a-z0-9-]{1,80}$/;

const loadProperty = async (params: PageProps<'/propiedades/[slug]'>['params']) => {
  const { slug } = await params;
  return SLUG_PATTERN.test(slug) ? getPropertyBySlug(slug) : null;
};

export async function generateMetadata({ params }: PageProps<'/propiedades/[slug]'>): Promise<Metadata> {
  const property = await loadProperty(params);
  if (!property) return { title: 'Propiedad no encontrada', robots: { index: false, follow: false } };
  const cover = property.images[0];
  return pageMetadata({
    title: `${property.name}, ${ZONE_LABELS[property.zone]}`,
    description: `${property.summary} ${PROPERTY_TYPE_LABELS[property.type]} de ${property.areaM2} m² en ${property.neighborhood}, ${MUNICIPALITY_LABELS[property.municipality]}. Canon ${formatCOP(property.monthlyRent)} al mes.`,
    path: `/propiedades/${property.slug}`,
    image: cover ? { url: cover.src, width: cover.width, height: cover.height, alt: cover.alt } : undefined,
  });
}

export default async function PropertyPage({ params }: PageProps<'/propiedades/[slug]'>) {
  const property = await loadProperty(params);
  if (!property) notFound();

  const similar = await getSimilarProperties(property);
  const reference = propertyReference(property.id);
  const whatsappNumber = getServerEnv().WHATSAPP_BUSINESS_NUMBER;
  const whatsappHref = whatsappNumber
    ? whatsappLink(whatsappNumber, `Hola, me interesa ${property.name} (Ref. ${reference}) que vi en ${site.name}.`)
    : null;
  const location =
    ZONE_LABELS[property.zone] === MUNICIPALITY_LABELS[property.municipality]
      ? MUNICIPALITY_LABELS[property.municipality]
      : `${ZONE_LABELS[property.zone]}, ${MUNICIPALITY_LABELS[property.municipality]}`;
  const paragraphs = property.description.split(/\n{2,}/);

  return (
    <article className="pb-28 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(propertyJsonLd(property, getSiteUrl())) }} />

      <div className="shell pt-28 sm:pt-36">
        <nav aria-label="Ruta de navegación" className="text-[0.8125rem] text-ink-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-charcoal">
                Inicio
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/propiedades" className="hover:text-charcoal">
                Propiedades
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-charcoal">
              {property.name}
            </li>
          </ol>
        </nav>

        <header className="mt-8 grid gap-8 border-b border-line pb-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-3">
              <AvailabilityBadge availability={property.availability} className="border border-line" />
              <span className="eyebrow text-bronze-deep">
                {PROPERTY_TYPE_LABELS[property.type]} · {location}
              </span>
            </div>
            <h1 className="display mt-5 text-[clamp(2.75rem,6vw,5.75rem)] font-light" data-testid="property-title">
              {property.name}
            </h1>
            <p className="mt-4 text-[1.0625rem] text-ink-muted">
              {property.neighborhood}, {MUNICIPALITY_LABELS[property.municipality]} · {property.layout}
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">Canon mensual</p>
            <p className="mt-2 font-serif text-[clamp(2.4rem,4vw,3.25rem)] leading-none" data-testid="detail-rent">
              {formatCOP(property.monthlyRent)}
            </p>
            <p className="mt-2 text-sm text-ink-muted" data-testid="detail-admin-fee">
              {property.administrationFee
                ? `+ administración ${formatCOP(property.administrationFee)} al mes`
                : 'Sin cuota de administración'}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4 lg:justify-end">
              <FavoriteButton slug={property.slug} name={property.name} variant="inline" />
              <span className="text-xs tracking-[0.12em] text-ink-muted">Ref. {reference}</span>
            </div>
          </div>
        </header>
      </div>

      <div className="shell mt-8">
        <PropertyGallery images={property.images} name={property.name} />
      </div>

      <div className="shell mt-14 grid gap-16 lg:grid-cols-12 lg:gap-10 xl:gap-16">
        <div className="lg:col-span-7">
          <KeyFacts property={property} />

          <section aria-labelledby="descripcion-title" className="mt-14">
            <h2 id="descripcion-title" className="eyebrow text-bronze-deep">
              Sobre la residencia
            </h2>
            <div className="mt-6 space-y-5">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={paragraph.slice(0, 32)}
                  className={cn(
                    paragraph === DEMO_NOTICE
                      ? 'border-l-2 border-bronze pl-4 text-sm leading-relaxed text-ink-muted'
                      : index === 0
                        ? 'font-serif text-[1.65rem] leading-snug'
                        : 'text-[1.0625rem] leading-relaxed text-ink-muted',
                  )}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <div className="mt-14">
            <PropertyDisclosures property={property} />
          </div>
        </div>

        <aside className="lg:col-span-5 xl:col-span-4 xl:col-start-9" aria-label="Contacto">
          <div>
            <ContactPanel
              propertyId={property.id}
              propertyName={property.name}
              availability={property.availability}
              dateBounds={visitDateBounds(new Date())}
              whatsappHref={whatsappHref}
            />
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="similares-title" className="mt-28 border-t border-line bg-surface py-24">
          <div className="shell">
            <p className="eyebrow text-bronze-deep">También podría interesarte</p>
            <h2 id="similares-title" className="display mt-4 text-[clamp(2.2rem,4.4vw,3.75rem)] font-light">
              Residencias similares
            </h2>
            <p className="mt-3 text-ink-muted">Elegidas por tipo de inmueble, zona y presupuesto.</p>
            <ul className="mt-12 grid gap-x-6 gap-y-14 md:grid-cols-2 xl:grid-cols-3" data-testid="similar-properties">
              {similar.map((item) => (
                <li key={item.id}>
                  <PropertyCard property={item} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <MobileContactBar monthlyRent={property.monthlyRent} whatsappHref={whatsappHref} />
    </article>
  );
}
