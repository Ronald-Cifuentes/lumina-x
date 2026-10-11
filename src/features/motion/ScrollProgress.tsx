'use client';

import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { cn } from '@/shared/lib/cn';

/** Thin reading-progress rule along the top edge of the viewport. */
export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const reduce = useReducedMotion();
  const smoothed = useSpring(scrollYProgress, { stiffness: 220, damping: 40, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden="true"
      data-testid="scroll-progress"
      style={{ scaleX: reduce ? scrollYProgress : smoothed }}
      className={cn('pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-bronze', className)}
    />
  );
}
