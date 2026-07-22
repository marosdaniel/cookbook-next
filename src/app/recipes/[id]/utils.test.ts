import { describe, expect, it } from 'vitest';
import {
  extractYoutubeId,
  getDifficultyColor,
  scaleQuantity,
  sortByOrder,
} from './utils';

describe('recipe detail utils', () => {
  it('extracts youtube ids from youtu.be links', () => {
    expect(extractYoutubeId('https://youtu.be/abc123')).toBe('abc123');
  });

  it('extracts youtube ids from watch links', () => {
    expect(extractYoutubeId('https://www.youtube.com/watch?v=xyz789')).toBe(
      'xyz789',
    );
  });

  it('returns null for invalid youtube urls', () => {
    expect(extractYoutubeId('not-a-url')).toBeNull();
  });

  it('returns the correct difficulty colors', () => {
    expect(getDifficultyColor('medium')).toBe('yellow');
    expect(getDifficultyColor('hard')).toBe('red');
    expect(getDifficultyColor('easy')).toBe('green');
    expect(getDifficultyColor('unknown')).toBe('green');
  });

  it('scales quantities with the requested multiplier', () => {
    expect(scaleQuantity(2.5, 2)).toBe(5);
    expect(scaleQuantity(1.005, 2)).toBe(2.01);
  });

  it('sorts items by ascending order', () => {
    const items = [
      { order: 2, id: 'second' },
      { order: 1, id: 'first' },
      { order: 3, id: 'third' },
    ];

    expect(sortByOrder(items)).toEqual([
      { order: 1, id: 'first' },
      { order: 2, id: 'second' },
      { order: 3, id: 'third' },
    ]);
  });
});
