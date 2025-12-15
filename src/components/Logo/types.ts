import type { Route } from 'next';

export interface LogoProps {
  variant?: 'default' | 'icon';
  width?: number;
  height?: number;
  withText?: boolean;
  hideTextOnMobile?: boolean;
  priority?: boolean;
  href?: Route;
}
