'use client';

import {
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'motion/react';
import type { FC } from 'react';

type ReadingProgressProps = {
  nonce?: string;
};

const ReadingProgress: FC<ReadingProgressProps> = ({ nonce }) => {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <MotionConfig nonce={nonce} reducedMotion="user">
      <motion.div
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(90deg, var(--mantine-color-blue-6), var(--mantine-color-cyan-5))',
          height: 3,
          left: 0,
          originX: 0,
          position: 'fixed',
          right: 0,
          scaleX,
          top: 0,
          transformOrigin: 'left',
          zIndex: 300,
        }}
      />
    </MotionConfig>
  );
};

export default ReadingProgress;
