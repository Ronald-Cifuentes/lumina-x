'use client';

import { LoaderCircle, Search, SlidersHorizontal, X } from 'lucide-react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { type FormEvent, type ReactNode, useOptimistic, useRef, useState, useTransition } from 'react';
import { AnimatedFilterPanel } from '@/features/motion/AnimatedFilterPanel';
import { cn } from '@/shared/lib/cn';
import {
  type CatalogFilters,
  catalogHref,
  clearFilters,
  describeActiveFilters,
  MAX_QUERY_LENGTH,
  SORT_OPTIONS,
  type SortOption,
  updateFilters,
} from '../../catalog/params';
import { FilterFields } from './FilterFields';

type CatalogShellProps = {
  filters: CatalogFilters;
  total: number;
  rangeStart: number;
  rangeEnd: number;
  children: ReactNode;
};

type Patch = Partial<Omit<CatalogFilters, 'pagina'>>;

const resultsLabel = (total: number) => (total === 1 ? '1 residencia' : `${total} residencias`);

/**
 * Client shell around the server-rendered results. The URL is the single
 * source of truth: every change navigates, and `useOptimistic` keeps the
 * controls responsive while the server renders the new result set.
 */
export function CatalogShell({ filters, total, rangeStart, rangeEnd, children }: CatalogShellProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(filters);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerTriggerRef = useRef<HTMLButtonElement>(null);
  const active = describeActiveFilters(optimistic);

  const navigate = (next: CatalogFilters) => {
    startTransition(() => {
      setOptimistic(next);
      router.push(catalogHref(next) as Route, { scroll: false });
    });
  };

  const apply = (patch: Patch) => navigate(updateFilters(optimistic, patch));

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('q');
    apply({ q: typeof value === 'string' && value.trim() ? value.trim().slice(0, MAX_QUERY_LENGTH) : undefined });
  };

  const status = isPending ? 'Actualizando resultados…' : total === 0 ? 'Sin resultados' : `${resultsLabel(total)}`;

  return (
    <div className="lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[17.5rem_minmax(0,1fr)] xl:gap-16">
      <aside aria-label="Filtros" className="hidden lg:block">
        <div className="sticky top-28 max-h-[calc(100svh-8rem)] overflow-y-auto overscroll-contain pb-10 pr-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-[1.75rem]">Filtros</h2>
            {active.length > 0 && (
              <button
                type="button"
                onClick={() => navigate(clearFilters(optimistic))}
                className="text-[0.8125rem] underline decoration-line-strong underline-offset-4 hover:decoration-charcoal"
              >
                Limpiar
              </button>
            )}
          </div>
          <div className="mt-5">
            <FilterFields filters={optimistic} onChange={apply} idPrefix="desktop" />
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-col gap-4 border-y border-line py-4 md:flex-row md:items-center md:justify-between">
          <form role="search" aria-label="Buscar en el catálogo" onSubmit={onSearch} className="flex w-full max-w-md items-stretch">
            <label htmlFor="catalog-q" className="sr-only">
              Buscar por nombre, barrio o municipio
            </label>
            <div className="relative flex-1">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
              <input
                key={filters.q ?? ''}
                id="catalog-q"
                name="q"
                type="search"
                defaultValue={filters.q ?? ''}
                maxLength={MAX_QUERY_LENGTH}
                placeholder="Nombre, barrio o municipio"
                autoComplete="off"
                className="h-11 w-full border border-line-strong bg-surface pl-9 pr-3 text-[0.9rem] placeholder:text-ink-muted/80 hover:border-charcoal"
              />
            </div>
            <button
              type="submit"
              className="h-11 bg-charcoal px-4 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ivory hover:bg-charcoal-soft"
            >
              Buscar
            </button>
          </form>

          <div className="flex items-center gap-3">
            <button
              ref={drawerTriggerRef}
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-haspopup="dialog"
              aria-controls="filtros-catalogo"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 border border-charcoal px-4 text-[0.8125rem] font-medium md:flex-none lg:hidden"
            >
              <SlidersHorizontal aria-hidden="true" className="size-4" strokeWidth={1.6} />
              Filtros
              {active.length > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-charcoal px-1.5 text-[0.6875rem] text-ivory">
                  {active.length}
                </span>
              )}
            </button>
            <label htmlFor="catalog-orden" className="sr-only">
              Ordenar por
            </label>
            <select
              id="catalog-orden"
              value={optimistic.orden}
              onChange={(event) => apply({ orden: event.target.value as SortOption })}
              className="select-chevron h-11 flex-1 border border-line-strong bg-surface px-3 pr-9 text-[0.875rem] hover:border-charcoal md:flex-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 py-5">
          <p role="status" aria-live="polite" className="flex items-center gap-2 text-[0.875rem] text-ink-muted" data-testid="result-count">
            {isPending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
            <span>
              {status}
              {!isPending && total > 0 && (
                <span className="text-ink-muted/90">
                  {' '}
                  · mostrando {rangeStart}–{rangeEnd}
                </span>
              )}
            </span>
          </p>
          {active.length > 0 && (
            <ul aria-label="Filtros activos" className="flex flex-wrap items-center gap-2">
              {active.map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => apply({ [item.key]: undefined })}
                    className="inline-flex items-center gap-1.5 bg-ivory-deep px-3 py-1.5 text-[0.8125rem] hover:bg-charcoal hover:text-ivory"
                  >
                    {item.label}
                    <X aria-hidden="true" className="size-3.5" />
                    <span className="sr-only">(quitar filtro)</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => navigate(clearFilters(optimistic))}
                  className="px-2 py-1.5 text-[0.8125rem] font-semibold underline underline-offset-4"
                >
                  Limpiar todo
                </button>
              </li>
            </ul>
          )}
        </div>

        <div aria-busy={isPending} className={cn('transition-opacity duration-300', isPending && 'opacity-55')}>
          {children}
        </div>
      </div>

      <AnimatedFilterPanel
        id="filtros-catalogo"
        title="Filtros"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        returnFocusRef={drawerTriggerRef}
        footer={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(clearFilters(optimistic))}
              className="h-12 px-4 text-[0.8125rem] font-semibold underline underline-offset-4"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="flex h-12 flex-1 items-center justify-center gap-2 bg-charcoal text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-ivory"
            >
              {isPending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" /> : null}
              Ver {resultsLabel(total)}
            </button>
          </div>
        }
      >
        <FilterFields filters={optimistic} onChange={apply} idPrefix="drawer" />
      </AnimatedFilterPanel>
    </div>
  );
}
