import type { Variants } from 'motion/react';
import { MOTION_TRANSITION } from './transitions';

/**
 * Note (V1): RecipeCard hover-lift (translateY -4px) is deliberately kept in CSS
 * (RecipeCard.module.css) for 60fps rendering without JS overhead.
 * Motion handles enter/exit, stagger, tap feedback, and layout transitions.
 */
export const listVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: MOTION_TRANSITION.standard,
  },
};
