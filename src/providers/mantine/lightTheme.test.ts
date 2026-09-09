import { describe, expect, it } from 'vitest';
import { lightTheme } from './lightTheme';

describe('lightTheme', () => {
  it('should have the correct primary color', () => {
    expect(lightTheme.primaryColor).toBe('pink');
  });

  it('should have custom bright-pink colors', () => {
    expect(lightTheme.colors).toHaveProperty('bright-pink');
    expect(lightTheme.colors?.['bright-pink']).toHaveLength(10);
  });

  it('should have meadow green colors', () => {
    expect(lightTheme.colors).toHaveProperty('meadow');
    expect(lightTheme.colors?.meadow).toHaveLength(10);
  });

  it('should have autoContrast enabled', () => {
    expect(lightTheme.autoContrast).toBe(true);
  });

  it('should define the primary shade, gradient, radius, and shadows', () => {
    expect(lightTheme.primaryShade).toEqual({ light: 7, dark: 5 });
    expect(lightTheme.defaultGradient).toEqual({
      from: 'pink',
      to: 'violet',
      deg: 45,
    });
    expect(lightTheme.defaultRadius).toBe('md');
    expect(lightTheme.radius).toEqual(
      expect.objectContaining({
        xs: expect.any(String),
        sm: expect.any(String),
        md: expect.any(String),
        lg: expect.any(String),
        xl: expect.any(String),
      }),
    );
    expect(lightTheme.shadows).toHaveProperty('xs');
    expect(lightTheme.shadows).toHaveProperty('xl');
  });

  it('should expose all semantic color palettes', () => {
    expect(lightTheme.colors).toEqual(
      expect.objectContaining({
        pink: expect.any(Array),
        violet: expect.any(Array),
        teal: expect.any(Array),
        orange: expect.any(Array),
        red: expect.any(Array),
        gray: expect.any(Array),
        dark: expect.any(Array),
      }),
    );
  });

  it('should have correct component default props', () => {
    expect(lightTheme.components?.AppShell?.defaultProps).toEqual({
      bg: 'var(--mantine-color-body)',
    });
    expect(
      (lightTheme.components?.NavLink as Record<string, unknown>)?.defaultProps,
    ).toEqual({
      c: 'gray.7',
      fw: 600,
    });
  });
});
