import type { Route } from 'next';
import Link from 'next/link';
import { type CatalogFilters, CATALOG_PATH, catalogHref, describeActiveFilters, updateFilters } from '../../catalog/params';

/** Explains why nothing matched and offers the two most useful ways out. */
export function EmptyState({ filters }: { filters: CatalogFilters }) {
  const active = describeActiveFilters(filters);
  const lastFilter = active.at(-1);
  const relaxed = lastFilter ? catalogHref(updateFilters(filters, { [lastFilter.key]: undefined })) : CATALOG_PATH;

  return (
    <div className="border border-line bg-surface px-6 py-16 text-center sm:px-12" data-testid="empty-state">
      <p className="display text-[4.5rem] font-light leading-none text-bronze">0</p>
      <h2 className="mt-4 font-serif text-[2rem] leading-tight">No encontramos residencias con esos criterios.</h2>
      <p className="mx-auto mt-4 max-w-lg text-[0.95rem] leading-relaxed text-ink-muted">
        Prueba ampliando el presupuesto, cambiando de zona o quitando alguna condición. También puedes pedirle a un asesor
        que busque por ti.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          prefetch={false}
          href={CATALOG_PATH}
          className="inline-flex h-12 items-center bg-charcoal px-6 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-ivory hover:bg-charcoal-soft"
        >
          Restablecer filtros
        </Link>
        {lastFilter && active.length > 1 && (
          <Link
            prefetch={false}
            href={relaxed as Route}
            className="inline-flex h-12 items-center border border-charcoal px-6 text-[0.75rem] font-semibold uppercase tracking-[0.16em]"
          >
            Quitar «{lastFilter.label}»
          </Link>
        )}
        <Link prefetch={false} href="/contacto" className="text-[0.875rem] underline underline-offset-4">
          Pedir una búsqueda asistida
        </Link>
      </div>
    </div>
  );
}
