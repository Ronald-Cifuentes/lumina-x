'use client';

import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

/** With `reducedMotion="user"`, transform and layout animations are skipped when the OS asks for less motion. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
