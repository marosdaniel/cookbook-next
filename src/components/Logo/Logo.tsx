'use client';

import { Group, Text, useComputedColorScheme } from '@mantine/core';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LOGO_SRC_DARK, LOGO_SRC_LIGHT } from './consts';
import type { LogoProps } from './types';

const LOGO_TRANSITION = {
  type: 'spring',
  stiffness: 400,
  damping: 24,
  mass: 0.7,
} as const;

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
  const t = useTranslations('logo');

  const size = variant === 'icon' ? 40 : 120;
  const logoSrc = colorScheme === 'dark' ? LOGO_SRC_DARK : LOGO_SRC_LIGHT;

  const image = (
    <Image
      src={logoSrc}
      alt={variant === 'icon' ? t('alt.icon') : t('alt.full')}
      width={width ?? size}
      height={height ?? size}
      priority={priority}
      data-testid="logo-image"
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
      {t('text')}
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

  if (!href) {
    return logo;
  }

  const isCurrentPage = pathname === href;

  return (
    <motion.div
      whileHover={isCurrentPage ? undefined : { scale: 1.025 }}
      whileTap={isCurrentPage ? undefined : { scale: 0.98 }}
      transition={LOGO_TRANSITION}
      style={{
        display: 'inline-flex',
        transformOrigin: 'left center',
      }}
    >
      <Link
        href={href}
        style={{
          color: 'inherit',
          cursor: isCurrentPage ? 'default' : 'pointer',
          textDecoration: 'none',
        }}
        onClick={(event) => {
          if (isCurrentPage) {
            event.preventDefault();
          }
        }}
        aria-current={isCurrentPage ? 'page' : undefined}
        data-testid="logo-link"
      >
        {logo}
      </Link>
    </motion.div>
  );
};

export const LogoIcon = (props: Omit<LogoProps, 'variant'>) => (
  <Logo {...props} variant="icon" priority />
);
