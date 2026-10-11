'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/shared/lib/cn';
import { useFavorites } from './store';

export function FavoritesLink({ className }: { className?: string }) {
  const { count } = useFavorites();
  return (
    <Link
      href="/favoritos"
      aria-label={count > 0 ? `Favoritos: ${count} guardados` : 'Favoritos'}
      className={cn('relative inline-flex size-10 items-center justify-center rounded-full hover:bg-charcoal/5', className)}
    >
      <Heart aria-hidden="true" className="size-[18px]" strokeWidth={1.6} />
      {count > 0 && (
        <span
          aria-hidden="true"
          data-testid="favorites-count"
          className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-bronze-deep px-1 text-[10px] font-semibold leading-4 text-surface"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
