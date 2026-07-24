export const CAROUSEL_PROPS = {
  slideSize: { base: '90%', sm: '45%', md: '30%', lg: '23%' },
  slideGap: 'md' as const,
  withControls: true,
  emblaOptions: { containScroll: 'trimSnaps' as const },
};

export const SKELETON_IDS = [
  'skeleton-a',
  'skeleton-b',
  'skeleton-c',
  'skeleton-d',
  'skeleton-e',
  'skeleton-f',
  'skeleton-g',
  'skeleton-h',
] as const;
