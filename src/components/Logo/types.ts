import type { Route } from 'next';
import type { ComponentProps } from 'react';

export interface LogoProps {
  variant?: 'default' | 'icon';
  width?: number;
  height?: number;
  withText?: boolean;
  hideTextOnMobile?: boolean;
  priority?: boolean;
  href?: Route;
}

export interface ImageProps extends ComponentProps<'img'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}
