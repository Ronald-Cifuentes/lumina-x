'use client';

import { ArrowRight } from 'lucide-react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { CATALOG_PATH } from '@/features/properties/catalog/params';
import { PROPERTY_TYPE_LABELS, PROPERTY_TYPES, ZONE_LABELS, ZONES } from '@/features/properties/domain';
import { formatCOP } from '@/shared/lib/format';

const BUDGETS = [2_500_000, 4_000_000, 7_000_000, 12_000_000, 20_000_000] as const;

const selectClass =
  'select-chevron mt-1.5 block w-full border-0 border-b border-line-strong bg-transparent py-2 pr-6 text-[0.95rem] text-charcoal focus:border-charcoal';

/**
 * A plain GET form, so it works before hydration; with JavaScript the empty
 * fields are dropped to keep the shared URL clean.
 */
export function HeroSearch() {
  const router = useRouter();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(event.currentTarget)) {
      if (typeof value === 'string' && value) params.set(key, value);
    }
    const query = params.toString();
    router.push((query ? `${CATALOG_PATH}?${query}` : CATALOG_PATH) as Route);
  };

  return (
    <form
      action={CATALOG_PATH}
      method="get"
      role="search"
      aria-label="Buscar propiedades en arriendo"
      onSubmit={onSubmit}
      className="w-full bg-ivory/95 p-6 text-charcoal shadow-[0_40px_80px_-40px_rgb(0_0_0/0.6)] backdrop-blur-sm sm:p-7"
    >
      <p className="eyebrow text-bronze-deep">Busca tu próxima casa</p>
      <div className="mt-5 grid gap-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        <label className="block text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
          Ubicación
          <select name="zona" defaultValue="" className={selectClass}>
            <option value="">Todo el valle</option>
            {ZONES.map((zone) => (
              <option key={zone} value={zone}>
                {ZONE_LABELS[zone]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
          Presupuesto
          <select name="precioMax" defaultValue="" className={selectClass}>
            <option value="">Sin tope</option>
            {BUDGETS.map((budget) => (
              <option key={budget} value={budget}>
                Hasta {formatCOP(budget)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
          Tipo
          <select name="tipo" defaultValue="" className={selectClass}>
            <option value="">Todos</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {PROPERTY_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="submit"
        className="group mt-6 flex w-full items-center justify-between bg-charcoal px-5 py-4 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-charcoal-soft"
      >
        Buscar residencias
        <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
      </button>
    </form>
  );
}
