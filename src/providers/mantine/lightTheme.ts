import {
  createTheme,
  type MantineColorsTuple,
  type MantineTheme,
  type MantineThemeOverride,
  rem,
} from '@mantine/core';

/**
 * Cookbook design system — light theme.
 *
 * Brand anchor: Mantine pink.7 (#E00890).
 * The `pink` tuple is overridden so that index 7 is exactly the brand color,
 * which keeps every existing `color="pink"` / `pink.7` usage on-brand.
 *
 * Palette roles:
 * - pink   → primary / brand (CTA, links, active states)
 * - violet → secondary accent (gradients: pink → violet, deg 45)
 * - teal   → fresh/success accent (dietary badges, success states)
 * - orange → warm accent (warnings, cost/spice indicators)
 * - red    → error / destructive
 * - gray   → warm-tinted neutral scale
 */

/** Primary brand scale — index 7 === #E00890 */
const brandPink: MantineColorsTuple = [
  '#FFEBF5', // 0 — subtle backgrounds, hover tints
  '#FFD6EB', // 1
  '#F9ADD6', // 2
  '#F480C1', // 3
  '#EF5BAF', // 4
  '#EC3EA4', // 5 — primary shade in dark mode
  '#EA2C9D', // 6
  '#E00890', // 7 — PRIMARY (light mode)
  '#C50E82', // 8 — hover on primary
  '#AD1374', // 9 — active/pressed
];

/** Secondary accent — harmonized with brand pink for gradients */
const berryViolet: MantineColorsTuple = [
  '#F5EDFF',
  '#E7D9FA',
  '#CBB0F0',
  '#AE85E7',
  '#965FDF',
  '#8746DA',
  '#7F39D8',
  '#6D28C0',
  '#611FAC',
  '#541898',
];

/** Fresh accent — success states, "healthy" badges */
const herbTeal: MantineColorsTuple = [
  '#E4FBF4',
  '#D0F6E9',
  '#A3ECD3',
  '#72E2BB',
  '#4BD9A7',
  '#33D49A',
  '#24D193',
  '#12B87F',
  '#00A470',
  '#008F5F',
];

/** Warm accent — warning states, cooking-time / cost indicators */
const saffronOrange: MantineColorsTuple = [
  '#FFF4E1',
  '#FFE8CB',
  '#FFCF9A',
  '#FDB564',
  '#FC9E37',
  '#FB901A',
  '#FB8907',
  '#E07600',
  '#C86800',
  '#AE5900',
];

/** Error / destructive */
const errorRed: MantineColorsTuple = [
  '#FFF5F5',
  '#FFE3E3',
  '#FFC9C9',
  '#FFA8A8',
  '#FF8787',
  '#FF6B6B',
  '#FA5252',
  '#F03E3E',
  '#E03131',
  '#C92A2A',
];

/** Warm-tinted neutral scale (slight pink undertone for brand coherence) */
const warmGray: MantineColorsTuple = [
  '#F9F8F9',
  '#F3F1F3',
  '#E9E6E9',
  '#DDD9DD',
  '#C9C4C9',
  '#ADA7AD',
  '#8B858B',
  '#5F5A5F',
  '#3E3A3E',
  '#262326',
];

/** Elevated dark surfaces — used by Mantine when color scheme is dark */
const inkDark: MantineColorsTuple = [
  '#C9C9CE', // 0 — primary text on dark
  '#B8B8BF', // 1
  '#A0A0A8', // 2 — secondary text
  '#8E8E96', // 3
  '#5F5F66', // 4 — borders
  '#3F3F46', // 5
  '#2E2E33', // 6 — elevated surface (cards, popovers)
  '#26262B', // 7 — body background
  '#1D1D21', // 8
  '#161619', // 9
];

export const lightTheme: MantineThemeOverride = createTheme({
  primaryColor: 'pink',
  // pink.7 in light mode, pink.5 in dark mode (better contrast on dark bg)
  primaryShade: { light: 7, dark: 5 },
  colors: {
    pink: brandPink,
    // Legacy alias kept for backwards compatibility
    'bright-pink': brandPink,
    violet: berryViolet,
    teal: herbTeal,
    orange: saffronOrange,
    red: errorRed,
    gray: warmGray,
    dark: inkDark,
  },
  autoContrast: true,
  luminanceThreshold: 0.61,
  defaultGradient: { from: 'pink', to: 'violet', deg: 45 },
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontFamilyMonospace:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  headings: {
    fontWeight: '700',
    sizes: {
      h1: { fontSize: rem(34), lineHeight: '1.25' },
      h2: { fontSize: rem(26), lineHeight: '1.3' },
      h3: { fontSize: rem(21), lineHeight: '1.35' },
      h4: { fontSize: rem(18), lineHeight: '1.4' },
    },
  },
  defaultRadius: 'md',
  radius: {
    xs: rem(4),
    sm: rem(6),
    md: rem(10),
    lg: rem(14),
    xl: rem(20),
  },
  shadows: {
    xs: '0 1px 2px rgba(38, 6, 28, 0.05)',
    sm: '0 1px 2px rgba(38, 6, 28, 0.06), 0 2px 8px rgba(38, 6, 28, 0.04)',
    md: '0 2px 4px rgba(38, 6, 28, 0.06), 0 8px 24px rgba(38, 6, 28, 0.08)',
    lg: '0 4px 8px rgba(38, 6, 28, 0.08), 0 16px 40px rgba(38, 6, 28, 0.12)',
    xl: '0 8px 16px rgba(38, 6, 28, 0.10), 0 24px 56px rgba(38, 6, 28, 0.16)',
  },
  cursorType: 'pointer',
  respectReducedMotion: true,
  components: {
    AppShell: {
      defaultProps: {
        bg: 'var(--mantine-color-body)',
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: { fontWeight: 600 },
      },
    },
    ActionIcon: {
      defaultProps: {
        radius: 'md',
      },
    },
    Anchor: {
      defaultProps: {
        underline: 'hover',
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        shadow: 'sm',
        withBorder: true,
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'sm',
      },
    },
    Modal: {
      defaultProps: {
        radius: 'lg',
        overlayProps: { backgroundOpacity: 0.45, blur: 4 },
      },
    },
    Tooltip: {
      defaultProps: {
        radius: 'md',
      },
    },
    InputWrapper: {
      styles: (theme: MantineTheme) => ({
        label: {
          color: theme.colors.gray[7],
          fontWeight: 500,
        },
      }),
    },
    Checkbox: {
      defaultProps: {
        c: 'pink.7',
      },
    },
    NavLink: {
      defaultProps: {
        c: 'gray.7',
        fw: 600,
      },
    },
    Title: {
      defaultProps: {
        c: 'gray.8',
      },
    },
    Text: {
      defaultProps: {
        c: 'gray.8',
      },
    },
  },
});
