'use client';

import { useComputedColorScheme } from '@mantine/core';
import Image from 'next/image';

interface BaseLogoProps {
  className?: string;
}

export interface LogoProps extends BaseLogoProps {
  width?: number;
  height?: number;
  priority?: boolean;
}

export interface LogoIconProps extends BaseLogoProps {
  size?: number;
}

/**
 * Hook to get the appropriate logo source based on the current color scheme
 */
function useLogoSrc() {
  const colorScheme = useComputedColorScheme('light');
  const isDark = colorScheme === 'dark';

  return {
    src: isDark ? '/logo-dark.png' : '/logo-light.png',
    isDark,
  };
}

/**
 * Cookbook Logo Component
 * Full-sized logo with customizable dimensions
 * Automatically switches between light and dark mode logos
 */
export function Logo({
  width = 120,
  height = 120,
  className = '',
  priority = false,
}: LogoProps) {
  const { src } = useLogoSrc();

  return (
    <Image
      src={src}
      alt="Cookbook Logo"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}

/**
 * Cookbook Logo Icon Component
 * Compact square logo for navbar, buttons, etc.
 * Always uses priority loading and square dimensions
 */
export function LogoIcon({ size = 40, className = '' }: LogoIconProps) {
  const { src } = useLogoSrc();

  return (
    <Image
      src={src}
      alt="Cookbook"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
