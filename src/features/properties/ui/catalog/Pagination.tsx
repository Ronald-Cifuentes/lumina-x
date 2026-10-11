import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { cn } from '@/shared/lib/cn';
import { type CatalogFilters, catalogHref, pageWindow } from '../../catalog/params';

type PaginationProps = { filters: CatalogFilters; page: number; pageCount: number };

const pageHref = (filters: CatalogFilters, page: number) => `${catalogHref({ ...filters, pagina: page })}#resultados` as Route;

const edge = 'inline-flex h-11 min-w-11 items-center justify-center gap-2 px-2 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] sm:px-3';

/** Real links: each page has a shareable URL and the browser history records every step. */
export function Pagination({ filters, page, pageCount }: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label="Paginación" className="mt-20 flex items-center justify-between gap-2 border-t border-line pt-6">
      {page > 1 ? (
        <Link prefetch={false} href={pageHref(filters, page - 1)} rel="prev" className={cn(edge, 'hover:text-bronze-deep')}>
          <ArrowLeft aria-hidden="true" className="size-4" />
          <span className="sr-only sm:not-sr-only">Anterior</span>
        </Link>
      ) : (
        <span aria-hidden="true" className={cn(edge, 'text-ink-muted/50')}>
          <ArrowLeft className="size-4" />
        </span>
      )}

      <ol className="flex items-center gap-1">
        {pageWindow(page, pageCount).map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-ink-muted">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                prefetch={false}
                href={pageHref(filters, item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Página ${item}`}
                className={cn(
                  'inline-flex size-11 items-center justify-center font-serif text-xl transition-colors',
                  item === page ? 'bg-charcoal text-ivory' : 'hover:bg-ivory-deep',
                )}
              >
                {String(item).padStart(2, '0')}
              </Link>
            </li>
          ),
        )}
      </ol>

      {page < pageCount ? (
        <Link prefetch={false} href={pageHref(filters, page + 1)} rel="next" className={cn(edge, 'hover:text-bronze-deep')}>
          <span className="sr-only sm:not-sr-only">Siguiente</span>
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <span aria-hidden="true" className={cn(edge, 'text-ink-muted/50')}>
          <ArrowRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
