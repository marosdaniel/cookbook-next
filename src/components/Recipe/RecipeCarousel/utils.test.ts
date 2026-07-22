import { describe, expect, it } from 'vitest';
import { getCarouselState } from './utils';

describe('getCarouselState', () => {
  it('returns loading when loading is true', () => {
    expect(getCarouselState(true, [])).toBe('loading');
  });

  it('returns empty when loading is false and recipes are empty', () => {
    expect(getCarouselState(false, [])).toBe('empty');
  });

  it('returns content when loading is false and recipes are present', () => {
    expect(getCarouselState(false, [{ id: '1' } as never])).toBe('content');
  });
});
