import {
  createTheme,
  type MantineTheme,
  type MantineThemeOverride,
} from '@mantine/core';
import { lightTheme } from './lightTheme';

/**
 * Cookbook design system — dark theme.
 *
 * Inherits the full palette, typography, radii and shadows from
 * `lightTheme` (including `primaryShade: { light: 7, dark: 5 }`, so the
 * primary automatically shifts to the brighter pink.5 on dark surfaces
 * for sufficient contrast).
 *
 * Dark-mode contrast rules:
 * - Body text: gray.2 (≈ #E9E6E9 on #26262B → ~11:1)
 * - Secondary text: gray.4 — never darker than gray.5 on dark surfaces
 * - Brand fills use pink.5 (#EC3EA4) instead of pink.7 to keep
 *   white-on-pink button text ≥ 4.5:1
 * - Shadows are stronger + borders subtler (elevation via surface color)
 */
export const darkTheme: MantineThemeOverride = createTheme({
  ...lightTheme,
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.3)',
    sm: '0 1px 2px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.3)',
    md: '0 2px 4px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.35)',
    lg: '0 4px 8px rgba(0, 0, 0, 0.45), 0 16px 40px rgba(0, 0, 0, 0.4)',
    xl: '0 8px 16px rgba(0, 0, 0, 0.5), 0 24px 56px rgba(0, 0, 0, 0.45)',
  },
  components: {
    ...lightTheme.components,
    InputWrapper: {
      styles: (theme: MantineTheme) => ({
        label: {
          color: theme.colors.gray[4],
          fontWeight: 500,
        },
      }),
    },
    Checkbox: {
      defaultProps: {
        c: 'pink.4',
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        shadow: 'sm',
        withBorder: false,
      },
    },
    NavLink: {
      defaultProps: {
        c: 'gray.4',
      },
    },
    Title: {
      defaultProps: {
        c: 'gray.2',
      },
    },
    Text: {
      defaultProps: {
        c: 'gray.2',
      },
    },
  },
});
