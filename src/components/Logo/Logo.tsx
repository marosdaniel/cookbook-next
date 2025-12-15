'use client';

import { Group, Text, useComputedColorScheme } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  withText = false,
  hideTextOnMobile = false,
  href,
}: LogoProps) => {
  // Use computed color scheme for SSR-safe theme detection
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });
  const pathname = usePathname();

  // Determine logo source based on theme
  const logoSrc =
    computedColorScheme === 'dark' ? LOGO_SRC_DARK : LOGO_SRC_LIGHT;

  // Default sizes based on variant
  const defaultSize = variant === 'icon' ? 40 : 120;
  const finalWidth = width ?? defaultSize;
  const finalHeight = height ?? defaultSize;

  const logoImage = (
    <Image
      src={logoSrc}
      alt={variant === 'icon' ? 'Cookbook' : 'Cookbook Logo'}
      width={finalWidth}
      height={finalHeight}
      className={withText ? undefined : className}
      priority={priority}
    />
  );

  const content = withText ? (
    <Group gap="xs" align="center" className={className}>
      {logoImage}
      <Text
        component="span"
        variant="gradient"
        gradient={{ from: 'pink', to: 'violet', deg: 45 }}
        fw={700}
        size={variant === 'icon' ? 'xl' : '2rem'}
        visibleFrom={hideTextOnMobile ? 'sm' : undefined}
        style={{ lineHeight: 1 }}
      >
        Cookbook
      </Text>
    </Group>
  ) : (
    logoImage
  );

  // Only render as link if href is provided
  if (href) {
    return (
      <Link
        href={href}
        style={{ textDecoration: 'none', color: 'inherit' }}
        onClick={(e) => {
          if (pathname === href) {
            e.preventDefault();
          }
        }}
      >
        {content}
      </Link>
    );
  }

  return content;
};

/**
 * Cookbook Logo Icon Component
 * Convenience wrapper for icon variant - for backward compatibility
 */
export const LogoIcon = (props: Omit<LogoProps, 'variant'>) => {
  return <Logo {...props} variant="icon" priority />;
};
