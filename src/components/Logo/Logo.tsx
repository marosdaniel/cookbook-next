'use client';

import { Group, Text, useComputedColorScheme } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LOGO_SRC_DARK, LOGO_SRC_LIGHT } from './consts';
import type { LogoProps } from './types';

export const Logo = ({
  variant = 'default',
  width,
  height,
  priority = false,
  withText = false,
  hideTextOnMobile = false,
  href,
}: LogoProps) => {
  const colorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });
  const pathname = usePathname();

  const size = variant === 'icon' ? 40 : 120;
  const logoSrc = colorScheme === 'dark' ? LOGO_SRC_DARK : LOGO_SRC_LIGHT;

  const image = (
    <Image
      src={logoSrc}
      alt={variant === 'icon' ? 'Cookbook' : 'Cookbook Logo'}
      width={width ?? size}
      height={height ?? size}
      priority={priority}
    />
  );

  const text = withText && (
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
  );

  const logo = withText ? (
    <Group gap="xs" align="center">
      {image}
      {text}
    </Group>
  ) : (
    image
  );

  if (!href) return logo;

  return (
    <Link
      href={href}
      style={{ textDecoration: 'none', color: 'inherit' }}
      onClick={(e) => pathname === href && e.preventDefault()}
    >
      {logo}
    </Link>
  );
};

export const LogoIcon = (props: Omit<LogoProps, 'variant'>) => (
  <Logo {...props} variant="icon" priority />
);
