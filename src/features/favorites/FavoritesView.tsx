'use client';

import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';
import type { PropertyCardData } from '@/features/properties/domain';
import { PropertyCard } from '@/features/properties/ui/PropertyCard';
import { useFavorites } from './store';

type Loaded = { key: string; items: PropertyCardData[]; failed: boolean };

const noopSubscribe = () => () => undefined;

export function FavoritesView() {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const { favorites, clear } = useFavorites();
  const key = favorites.join(',');
  const [loaded, setLoaded] = useState<Loaded>({ key: '', items: [], failed: false });

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    fetch(`/api/propiedades?slugs=${encodeURIComponent(key)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<{ properties: PropertyCardData[] }>;
      })
      .then((data) => setLoaded({ key, items: data.properties, failed: false }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setLoaded({ key, items: [], failed: Boolean(error) });
      });
    return () => controller.abort();
  }, [key]);

  if (!hydrated || (key && loaded.key !== key && loaded.items.length === 0)) {
    return (
      <p role="status" className="py-24 text-center text-ink-muted">
        Cargando tus favoritas…
      </p>
    );
  }

  if (!key) {
    return (
      <div className="border border-line bg-surface px-6 py-20 text-center" data-testid="favorites-empty">
        <h2 className="font-serif text-[2rem]">Aún no guardas residencias.</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-muted">
          Usa el corazón de cada ficha para guardarla. Tus favoritas quedan en este navegador, sin necesidad de crear una
          cuenta.
        </p>
        <Link
          href="/propiedades"
          className="mt-8 inline-flex h-12 items-center bg-charcoal px-6 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-ivory"
        >
          Explorar propiedades
        </Link>
      </div>
    );
  }

  if (loaded.failed && loaded.key === key) {
    return (
      <p role="alert" className="py-24 text-center text-error">
        No pudimos cargar tus favoritas. Recarga la página para intentarlo de nuevo.
      </p>
    );
  }

  const visible = loaded.items.filter((item) => favorites.includes(item.slug));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <p role="status" className="text-sm text-ink-muted" data-testid="favorites-count-text">
          {visible.length === 1 ? '1 residencia guardada' : `${visible.length} residencias guardadas`} en este navegador
        </p>
        <button type="button" onClick={clear} className="text-[0.8125rem] font-semibold underline underline-offset-4">
          Vaciar favoritas
        </button>
      </div>
      <ul className="mt-10 grid gap-x-6 gap-y-14 md:grid-cols-2 xl:grid-cols-3" data-testid="favorites-list">
        {visible.map((property) => (
          <li key={property.id}>
            <PropertyCard property={property} />
          </li>
        ))}
      </ul>
    </div>
  );
}
