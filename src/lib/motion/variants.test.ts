import { describe, expect, it } from 'vitest';
import { listItemVariants, listVariants } from './variants';

describe('motion variants', () => {
  it('defines listVariants with stagger', () => {
    expect(listVariants.hidden).toBeDefined();
    expect(listVariants.visible).toBeDefined();
  });

  it('defines listItemVariants with standard transition and opacity/y', () => {
    expect(listItemVariants.hidden).toEqual({ opacity: 0, y: 12 });
    expect(listItemVariants.visible).toHaveProperty('opacity', 1);
    expect(listItemVariants.visible).toHaveProperty('y', 0);
  });
});
