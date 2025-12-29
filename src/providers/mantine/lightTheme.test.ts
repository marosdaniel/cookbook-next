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

  it('should have autoContrast enabled', () => {
    expect(lightTheme.autoContrast).toBe(true);
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
