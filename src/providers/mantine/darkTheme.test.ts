import { describe, expect, it } from 'vitest';
import { darkTheme } from './darkTheme';
import { lightTheme } from './lightTheme';

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

  it('should configure dark-mode controls and stronger shadows', () => {
    expect(
      (darkTheme.components?.Checkbox as Record<string, unknown>)?.defaultProps,
    ).toEqual({ c: 'pink.4' });
    expect(
      (darkTheme.components?.Card as Record<string, unknown>)?.defaultProps,
    ).toEqual({ radius: 'lg', shadow: 'sm', withBorder: false });
    expect(darkTheme.shadows?.md).toContain('rgba(0, 0, 0, 0.4)');
    expect(darkTheme.shadows?.xl).toContain('rgba(0, 0, 0, 0.5)');
  });

  it('keeps the light theme palette and component overrides available', () => {
    expect(darkTheme.colors?.pink).toBe(lightTheme.colors?.pink);
    expect(
      (darkTheme.components?.InputWrapper as Record<string, unknown>)?.styles,
    ).toBeTypeOf('function');
  });
});
