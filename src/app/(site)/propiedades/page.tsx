import type { Metadata } from 'next';
import { StaggeredPropertyGrid } from '@/features/motion/StaggeredPropertyGrid';
import { DEFAULT_SORT, hasActiveFilters, parseCatalogParams } from '@/features/properties/catalog/params';
import { getCatalogPage, getFeaturedProperties, getPublishedCount } from '@/features/properties/server/repository';
import { CatalogShell } from '@/features/properties/ui/catalog/CatalogShell';
import { EditorialCarousel } from '@/features/properties/ui/catalog/EditorialCarousel';
import { EmptyState } from '@/features/properties/ui/catalog/EmptyState';
import { Pagination } from '@/features/properties/ui/catalog/Pagination';
import { PropertyCard } from '@/features/properties/ui/PropertyCard';
import { pageMetadata } from '@/shared/seo/metadata';

export const dynamic = 'force-dynamic';

const DESCRIPTION =
  'Apartamentos, apartaestudios, casas y lofts en arriendo en Medellín, Envigado, Sabaneta e Itagüí. Filtra por zona, canon, habitaciones, mascotas y disponibilidad.';

export async function generateMetadata({ searchParams }: PageProps<'/propiedades'>): Promise<Metadata> {
  const filters = parseCatalogParams(await searchParams);
  const metadata = pageMetadata({ title: 'Propiedades en arriendo', description: DESCRIPTION, path: '/propiedades' });
  const isVariant = hasActiveFilters(filters) || filters.pagina > 1 || filters.orden !== DEFAULT_SORT;
  return isVariant ? { ...metadata, robots: { index: false, follow: true } } : metadata;
}

const CAROUSEL_SIZES = '(min-width: 1280px) 25rem, (min-width: 1024px) 30vw, (min-width: 640px) 44vw, 80vw';

export default async function PropertiesPage({ searchParams }: PageProps<'/propiedades'>) {
  const filters = parseCatalogParams(await searchParams);
  const showSelection = !hasActiveFilters(filters) && filters.pagina === 1;
  const [result, selection, total] = await Promise.all([
    getCatalogPage(filters),
    showSelection ? getFeaturedProperties(6) : Promise.resolve([]),
    getPublishedCount(),
  ]);

  return (
    <>
      <header className="shell pt-28 sm:pt-40">
        <div className="grid gap-6 border-b border-line pb-8 sm:gap-8 sm:pb-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow text-bronze-deep">Catálogo · {total} residencias</p>
            <h1 className="display mt-4 text-[clamp(2.6rem,7.4vw,7rem)] font-light sm:mt-5">Residencias en arriendo</h1>
          </div>
          <div className="lg:col-span-4">
            <p className="text-base leading-relaxed text-ink-muted sm:text-[1.0625rem]">
              Medellín, Envigado, Sabaneta e Itagüí. Cánones mensuales en pesos colombianos; la cuota de administración se
              indica por separado.
            </p>
            <p className="mt-4 text-xs leading-relaxed text-ink-muted">
              <strong className="font-semibold text-charcoal">Portafolio demostrativo:</strong> inmuebles, precios,
              disponibilidad y fotografías son ilustrativos.
            </p>
          </div>
        </div>
      </header>

      {showSelection && selection.length > 0 && (
        <EditorialCarousel
          id="seleccion"
          eyebrow="Selección editorial"
          title="Seis residencias para empezar"
          items={selection.map((property, index) => ({
            id: property.id,
            node: <PropertyCard property={property} sizes={CAROUSEL_SIZES} preload={index === 0} />,
          }))}
        />
      )}

      <section id="resultados" aria-labelledby="catalogo-title" className="shell scroll-mt-28 pb-28 pt-8 sm:pt-10">
        <h2 id="catalogo-title" className="font-serif text-[1.85rem] leading-tight sm:text-[2.25rem]">
          Catálogo completo
        </h2>
        <div className="mt-6">
          <CatalogShell filters={filters} total={result.total} rangeStart={result.rangeStart} rangeEnd={result.rangeEnd}>
            {result.total === 0 ? (
              <EmptyState filters={filters} />
            ) : (
              <>
                <StaggeredPropertyGrid
                  label="Resultados"
                  className="grid-cols-1 gap-x-6 gap-y-16 md:grid-cols-2 xl:grid-cols-3"
                  items={result.items.map((property, index) => ({
                    id: property.id,
                    node: <PropertyCard property={property} preload={!showSelection && index === 0} />,
                  }))}
                />
                <Pagination filters={filters} page={result.page} pageCount={result.pageCount} />
              </>
            )}
          </CatalogShell>
        </div>
      </section>
    </>
  );
}
