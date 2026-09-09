'use client';

import { motion, useInView } from 'motion/react';
import { type CSSProperties, type PropsWithChildren, useRef } from 'react';
import { MOTION_TRANSITION } from './transitions';

export type RevealProps = PropsWithChildren<{
  /** Késleltetés másodpercben — stagger-hatáshoz szekvenciális elemeknél */
  delay?: number;
  /** Az elem mekkora részének kell látszania a triggerhez */
  amount?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
}>;

export const Reveal = ({
  children,
  delay = 0,
  amount = 0.25,
  y = 16,
  className,
  style,
}: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ ...MOTION_TRANSITION.slow, delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
