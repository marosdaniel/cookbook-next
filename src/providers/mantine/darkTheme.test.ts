import { describe, expect, it } from 'vitest';
import { darkTheme } from './darkTheme';

describe('darkTheme', () => {
  it('should inherit from lightTheme', () => {
    expect(darkTheme.primaryColor).toBe('pink');
    expect(darkTheme.colors).toHaveProperty('bright-pink');
  });

  it('should override component default props for dark mode', () => {
    expect(
      (darkTheme.components?.NavLink as Record<string, unknown>)?.defaultProps,
    ).toEqual({
      c: 'gray.4',
    });
    expect(
      (darkTheme.components?.Title as Record<string, unknown>)?.defaultProps,
    ).toEqual({
      c: 'gray.2',
    });
    expect(
      (darkTheme.components?.Text as Record<string, unknown>)?.defaultProps,
    ).toEqual({
      c: 'gray.2',
    });
  });
});
