'use client';

import { motion, useInView, useReducedMotion } from 'motion/react';
import { type ReactNode, useRef } from 'react';
import { cn } from '@/shared/lib/cn';
import { EDITORIAL_EASE } from './easing';

type ImageRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left';
};

const HIDDEN = { up: 'inset(100% 0% 0% 0%)', left: 'inset(0% 100% 0% 0%)' } as const;
const SHOWN = 'inset(0% 0% 0% 0%)';

/**
 * Clip-path reveal used selectively on editorial imagery, never on catalogue
 * cards. Visibility is observed on the unclipped frame: Chromium's
 * IntersectionObserver honours the target's own clip-path, so observing the
 * clipped layer itself would never report an intersection.
 */
export function ImageReveal({ children, className, delay = 0, direction = 'up' }: ImageRevealProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const inView = useInView(frameRef, { once: true, amount: 0.2 });
  const reduce = useReducedMotion();

  return (
    <div ref={frameRef} className={cn('relative overflow-hidden', className)}>
      <motion.div
        data-reveal
        className="absolute inset-0"
        initial={{ clipPath: HIDDEN[direction] }}
        animate={inView ? { clipPath: SHOWN } : undefined}
        transition={{ duration: reduce ? 0 : 1.15, ease: EDITORIAL_EASE, delay: reduce ? 0 : delay }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.12 }}
          animate={inView ? { scale: 1 } : undefined}
          transition={{ duration: reduce ? 0 : 1.6, ease: EDITORIAL_EASE, delay: reduce ? 0 : delay }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
