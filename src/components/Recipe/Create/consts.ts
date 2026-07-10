import { MOTION_TRANSITION } from '../../../lib/motion/transitions';

export const sectionVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: MOTION_TRANSITION.standard,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: MOTION_TRANSITION.fast,
  },
} as const;

export const NO_VALUE_FALLBACK = '—';
