// --- Animation variants ---

import type { Variants } from 'motion/react';

export const successIconVariants: Variants = {
  hidden: { scale: 0.4, opacity: 0, rotate: -15 },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: { duration: 0.45, ease: 'backOut' as const, delay: 0.1 },
  },
};

// ---
