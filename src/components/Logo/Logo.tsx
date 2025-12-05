'use client';

import { useMantineColorScheme } from '@mantine/core';
import Image from 'next/image';
import { LOGO_SRC_DARK, LOGO_SRC_LIGHT } from './consts';
import type { LogoProps } from './types';

/**
 * Cookbook Logo Component
 * Automatically switches between light/dark logo based on theme
 * Supports two variants: default (120x120) and icon (40x40)
 */
export const Logo = ({
  variant = 'default',
  width,
  height,
  className = '',
  priority = false,
}: LogoProps) => {
  const { colorScheme } = useMantineColorScheme();

  // Determine logo source based on theme
  const logoSrc = colorScheme === 'dark' ? LOGO_SRC_DARK : LOGO_SRC_LIGHT;

  // Default sizes based on variant
  const defaultSize = variant === 'icon' ? 40 : 120;
  const finalWidth = width ?? defaultSize;
  const finalHeight = height ?? defaultSize;

  return (
    <Image
      src={logoSrc}
      alt={variant === 'icon' ? 'Cookbook' : 'Cookbook Logo'}
      width={finalWidth}
      height={finalHeight}
      className={className}
      priority={priority}
    />
  );
};

/**
 * Cookbook Logo Icon Component
 * Convenience wrapper for icon variant - for backward compatibility
 */
export const LogoIcon = (props: Omit<LogoProps, 'variant'>) => {
  return <Logo {...props} variant="icon" priority />;
};
