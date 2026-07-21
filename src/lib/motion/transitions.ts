export const MOTION_TRANSITION = {
  fast: {
    duration: 0.15,
    ease: 'easeOut',
  },
  standard: {
    duration: 0.2,
    ease: 'easeOut',
  },
  slow: {
    duration: 0.28,
    ease: 'easeOut',
  },
  interactive: {
    type: 'spring',
    stiffness: 380,
    damping: 30,
    mass: 0.8,
  },
} as const;
