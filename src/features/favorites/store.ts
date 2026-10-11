'use client';

import { useCallback, useSyncExternalStore } from 'react';

export const FAVORITES_STORAGE_KEY = 'lumina:favoritos';
const CHANGE_EVENT = 'lumina:favoritos-cambio';
const MAX_FAVORITES = 50;
const SLUG_PATTERN = /^[a-z0-9-]{1,80}$/;
const EMPTY: readonly string[] = Object.freeze([]);

const parse = (raw: string | null): readonly string[] => {
  if (!raw) return EMPTY;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return EMPTY;
    const slugs = value.filter((item): item is string => typeof item === 'string' && SLUG_PATTERN.test(item));
    return Array.from(new Set(slugs)).slice(0, MAX_FAVORITES);
  } catch {
    return EMPTY;
  }
};

const readRaw = (): string | null => {
  try {
    return window.localStorage.getItem(FAVORITES_STORAGE_KEY);
  } catch {
    return null;
  }
};

let snapshot: { raw: string | null; value: readonly string[] } = { raw: null, value: EMPTY };

const getSnapshot = (): readonly string[] => {
  const raw = readRaw();
  if (raw !== snapshot.raw) snapshot = { raw, value: parse(raw) };
  return snapshot.value;
};

const getServerSnapshot = (): readonly string[] => EMPTY;

const subscribe = (onChange: () => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === FAVORITES_STORAGE_KEY) onChange();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
};

const write = (slugs: readonly string[]) => {
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const useFavorites = () => {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((slug: string) => {
    if (!SLUG_PATTERN.test(slug)) return;
    const current = getSnapshot();
    write(current.includes(slug) ? current.filter((item) => item !== slug) : [slug, ...current].slice(0, MAX_FAVORITES));
  }, []);

  const clear = useCallback(() => write([]), []);

  return { favorites, count: favorites.length, isFavorite: (slug: string) => favorites.includes(slug), toggle, clear };
};
