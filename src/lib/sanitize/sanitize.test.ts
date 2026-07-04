import { describe, expect, it } from 'vitest';

import { store } from '../store/store';
import { sanitizeOptional, sanitizeText } from './sanitize';

describe('sanitizeText', () => {
  it('removes tags and trims whitespace', () => {
    expect(sanitizeText('<strong>Hello</strong>  ')).toBe('Hello');
  });

  it('returns an empty string for values that contain only tags', () => {
    expect(sanitizeText('<p><span></span></p>')).toBe('');
  });

  it('keeps plain text intact while stripping attributes', () => {
    expect(sanitizeText('Hello <b data-x="1">world</b>')).toBe('Hello world');
  });
});

describe('sanitizeOptional', () => {
  it('returns undefined for nullish values', () => {
    expect(sanitizeOptional(null)).toBeUndefined();
    expect(sanitizeOptional(undefined)).toBeUndefined();
  });

  it('sanitizes string values', () => {
    expect(sanitizeOptional('<em>World</em>')).toBe('World');
  });

  it('preserves plain strings without markup', () => {
    expect(sanitizeOptional('Plain text')).toBe('Plain text');
  });
});

describe('store', () => {
  it('creates a store with the expected reducer slices', () => {
    const state = store.getState();

    expect(state).toHaveProperty('global');
    expect(state).toHaveProperty('metadata');
  });
});
