import type { TextProps, TitleProps } from '@mantine/core';
import type { ReactNode } from 'react';

export type StyledTextProps<C extends 'title' | 'text'> = {
  componentType?: C;
  gradient?: boolean; // Overriding Mantine's gradient prop type
  children?: ReactNode;
} & Omit<C extends 'title' ? TitleProps : TextProps, 'gradient'>;
