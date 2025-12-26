import type { TextProps, TitleProps } from '@mantine/core';

export type StyledTextProps<C extends 'title' | 'text'> = {
  componentType?: C;
  gradient?: boolean; // Overriding Mantine's gradient prop type
} & Omit<C extends 'title' ? TitleProps : TextProps, 'gradient'>;
