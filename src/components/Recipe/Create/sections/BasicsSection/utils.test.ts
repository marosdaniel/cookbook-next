import { describe, expect, it } from 'vitest';
import { toNonNegativeNumberOrEmpty } from './utils';

describe('toNonNegativeNumberOrEmpty', () => {
  it('returns an empty string for empty input', () => {
    expect(toNonNegativeNumberOrEmpty('')).toBe('');
  });

  it('returns an empty string for invalid or negative values', () => {
    expect(toNonNegativeNumberOrEmpty('abc')).toBe('');
    expect(toNonNegativeNumberOrEmpty('-1')).toBe('');
    expect(toNonNegativeNumberOrEmpty('Infinity')).toBe('');
  });

  it('returns the parsed non-negative number for valid values', () => {
    expect(toNonNegativeNumberOrEmpty('0')).toBe(0);
    expect(toNonNegativeNumberOrEmpty('12')).toBe(12);
  });
});
