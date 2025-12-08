import {
  createTheme,
  type MantineTheme,
  type MantineThemeOverride,
} from '@mantine/core';

export const lightTheme: MantineThemeOverride = createTheme({
  // fontFamily: 'Segoe UI',
  primaryColor: 'pink',
  colors: {
    'bright-pink': [
      '#F0BBDD',
      '#ED9BCF',
      '#EC7CC3',
      '#ED5DB8',
      '#F13EAF',
      '#F71FA7',
      '#FF00A1',
      '#E00890',
      '#C50E82',
      '#AD1374',
    ],
  },
  autoContrast: true,
  luminanceThreshold: 0.61,
  components: {
    AppShell: {
      defaultProps: {
        bg: 'var(--mantine-color-body)',
      },
    },
    Button: {
      defaultProps: {
        // c: 'pink.7',
      },
    },
    Anchor: {
      defaultProps: {
        // c: 'pink.7',
      },
    },
    InputWrapper: {
      styles: (theme: MantineTheme) => ({
        label: {
          color: theme.colors.gray[7],
        },
      }),
    },
    TextInput: {
      defaultProps: {
        // c: 'pink.7',
      },
    },
    PasswordInput: {
      defaultProps: {
        // c: 'pink.7',
      },
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
