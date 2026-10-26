// --- Animation variants ---

import type { Variants } from 'motion/react';
import { authButtonVariants } from '@/lib/motion/variants';

export const buttonVariants: Variants = {
  ...authButtonVariants,
  success: {
    scale: [1, 1.04, 1],
    transition: { duration: 0.3 },
  },
};
