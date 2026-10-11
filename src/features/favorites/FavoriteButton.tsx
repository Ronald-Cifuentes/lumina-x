'use client';

import { Heart } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useFavorites } from './store';

type FavoriteButtonProps = {
  slug: string;
  name: string;
  variant?: 'overlay' | 'inline';
  className?: string;
};

export function FavoriteButton({ slug, name, variant = 'overlay', className }: FavoriteButtonProps) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(slug);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`Guardar ${name} en favoritos`}
      title={active ? 'Guardado en favoritos' : 'Guardar en favoritos'}
      onClick={() => toggle(slug)}
      data-favorite={slug}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-colors duration-300',
        variant === 'overlay'
          ? 'z-10 size-10 rounded-full bg-surface/90 text-charcoal backdrop-blur-sm hover:bg-surface'
          : 'min-h-11 border border-line-strong px-4 text-sm hover:border-charcoal',
        className,
      )}
    >
      <Heart
        aria-hidden="true"
        className={cn('size-[18px] transition-transform duration-300', active && 'fill-bronze text-bronze motion-safe:scale-110')}
        strokeWidth={1.6}
      />
      {variant === 'inline' && <span>{active ? 'Guardado' : 'Guardar'}</span>}
    </button>
  );
}
