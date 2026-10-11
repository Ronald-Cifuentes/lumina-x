'use client';

import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { EDITORIAL_EASE } from './easing';

export type GridItem = { id: string; node: ReactNode };

type StaggeredPropertyGridProps = {
  items: GridItem[];
  className?: string;
  label: string;
};

/**
 * Server-rendered cards arrive fully visible (`initial={false}`); only cards
 * entering after a filter change fade in with a short stagger, and remaining
 * cards glide to their new position through layout animation.
 */
export function StaggeredPropertyGrid({ items, className, label }: StaggeredPropertyGridProps) {
  return (
    <ul aria-label={label} className={cn('relative grid', className)} data-testid="property-grid">
      <AnimatePresence mode="popLayout" initial={false}>
        {items.map((item, index) => (
          <motion.li
            key={item.id}
            layout="position"
            initial={{ opacity: 0, y: 28 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.55, ease: EDITORIAL_EASE, delay: Math.min(index, 8) * 0.045 },
            }}
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
            transition={{ layout: { duration: 0.45, ease: EDITORIAL_EASE } }}
          >
            {item.node}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
