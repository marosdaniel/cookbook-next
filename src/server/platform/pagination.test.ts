import { describe, expect, it } from 'vitest';
import {
  DEFAULT_QUERY_MAX_LIMIT,
  decodeCursor,
  encodeCursor,
  resolveQueryLimit,
} from './pagination';

const isPair = (value: unknown): value is { a: string; b: number } =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { a?: unknown }).a === 'string' &&
  typeof (value as { b?: unknown }).b === 'number';

describe('resolveQueryLimit', () => {
  it('returns undefined for missing or non-finite limits', () => {
    expect(resolveQueryLimit()).toBeUndefined();
    expect(resolveQueryLimit(null)).toBeUndefined();
    expect(resolveQueryLimit(Number.NaN)).toBeUndefined();
    expect(resolveQueryLimit(Number.POSITIVE_INFINITY)).toBeUndefined();
  });

  it('truncates and clamps to the [1, max] range', () => {
    expect(resolveQueryLimit(5.9)).toBe(5);
    expect(resolveQueryLimit(0)).toBe(1);
    expect(resolveQueryLimit(-10)).toBe(1);
    expect(resolveQueryLimit(DEFAULT_QUERY_MAX_LIMIT + 50)).toBe(
      DEFAULT_QUERY_MAX_LIMIT,
    );
  });
});

describe('encodeCursor / decodeCursor', () => {
  it('round-trips a payload through base64url JSON', () => {
    const cursor = encodeCursor({ a: 'x', b: 2 });

    expect(cursor).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeCursor(cursor, isPair)).toEqual({ a: 'x', b: 2 });
  });

  it('returns null when the cursor is missing or empty', () => {
    expect(decodeCursor(undefined, isPair)).toBeNull();
    expect(decodeCursor('', isPair)).toBeNull();
  });

  it('returns null when the payload fails the type guard', () => {
    expect(decodeCursor(encodeCursor({ a: 1 }), isPair)).toBeNull();
  });

  it('returns null for malformed input instead of throwing', () => {
    expect(decodeCursor('%%%not-base64-json', isPair)).toBeNull();
    expect(
      decodeCursor(Buffer.from('not json').toString('base64url'), isPair),
    ).toBeNull();
  });
});
