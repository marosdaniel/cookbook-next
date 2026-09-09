'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { MOTION_TRANSITION } from '@/lib/motion/transitions';

export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={MOTION_TRANSITION.fast}
    >
      {children}
    </motion.div>
  );
}
