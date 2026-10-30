export const toCssVariable = (color: string): string =>
  `var(--mantine-color-${color.replace('.', '-')})`;
