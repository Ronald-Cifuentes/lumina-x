'use client';

import { type MotionValue, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { type ReactNode, useRef } from 'react';

type ParallaxMediaProps = {
  children: ReactNode;
  /** Vertical translation in px at progress 0 and 1. */
  range: readonly [number, number];
  /** Shared progress (0–1). When omitted, the element tracks its own passage through the viewport. */
  progress?: MotionValue<number>;
  smooth?: boolean;
  className?: string;
  plane?: string;
};

/**
 * Moves its content with scroll using transforms only. Native scrolling is
 * never intercepted, and with reduced motion the content stays still.
 */
export function ParallaxMedia({ children, range, progress, smooth = false, className, plane }: ParallaxMediaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const raw = useTransform(progress ?? scrollYProgress, [0, 1], [range[0], range[1]]);
  const spring = useSpring(raw, { stiffness: 260, damping: 42, mass: 0.35 });

  return (
    <motion.div
      ref={ref}
      data-plane={plane}
      style={{ y: reduce ? 0 : smooth ? spring : raw }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
