// --- Animation variants ---

import type { Variants } from 'motion/react';

export const swapVariants: Variants = {
  hidden: { opacity: 0, y: 12, position: 'absolute' as const },
  visible: {
    opacity: 1,
    y: 0,
    position: 'relative' as const,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    y: -12,
    position: 'absolute' as const,
    transition: { duration: 0.25, ease: 'easeIn' as const },
  },
};

export const successIconVariants: Variants = {
  hidden: { scale: 0.6, opacity: 0, rotate: -10 },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: { duration: 0.4, ease: 'backOut' as const, delay: 0.1 },
  },
};

// ---
