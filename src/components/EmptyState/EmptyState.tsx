'use client';

import {
  Button,
  type ButtonProps,
  Center,
  Stack,
  Text,
  ThemeIcon,
  type ThemeIconVariant,
  Title,
} from '@mantine/core';
import { motion, useInView, useReducedMotion } from 'motion/react';
import type { Route } from 'next';
import Link from 'next/link';
import type { ElementType, ReactNode } from 'react';
import { useRef } from 'react';

export type EmptyStateAction<T extends string = string> = {
  label: ReactNode;
  onClick?: () => void;
  href?: Route<T> | string;
  component?: ElementType;
  leftSection?: ReactNode;
  variant?: ButtonProps['variant'];
  gradient?: ButtonProps['gradient'];
  size?: ButtonProps['size'];
  'data-testid'?: string;
} & Record<string, unknown>;

export type EmptyStateProps = {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: EmptyStateAction;
  children?: ReactNode;
  'data-testid'?: string;
  iconVariant?: ThemeIconVariant;
  iconSize?: number;
  iconGradient?: ButtonProps['gradient'];
};

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  children,
  'data-testid': testId,
  iconVariant = 'light',
  iconSize = 64,
  iconGradient,
}: EmptyStateProps) => {
  const iconRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(iconRef);
  const prefersReducedMotion = useReducedMotion();

  const shouldAnimate = !prefersReducedMotion && isInView;

  const { label, href, component, ...actionProps } = action ?? {};

  const renderActionButton = () => {
    if (!action) return null;

    if (href) {
      return (
        <Button
          component={Link}
          href={href as Route}
          mt="sm"
          {...(actionProps as ButtonProps)}
        >
          {label}
        </Button>
      );
    }

    if (component) {
      const PolymorphicButton = Button as unknown as ElementType;
      return (
        <PolymorphicButton component={component} mt="sm" {...actionProps}>
          {label}
        </PolymorphicButton>
      );
    }

    return (
      <Button mt="sm" {...(actionProps as ButtonProps)}>
        {label}
      </Button>
    );
  };

  return (
    <Center py={60} data-testid={testId}>
      <Stack align="center" gap="sm">
        <motion.div
          ref={iconRef}
          animate={shouldAnimate ? { y: [0, -6, 0] } : undefined}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        >
          <ThemeIcon
            size={iconSize}
            radius="xl"
            variant={iconVariant}
            gradient={iconGradient}
          >
            {icon}
          </ThemeIcon>
        </motion.div>
        <Title order={3} ta="center">
          {title}
        </Title>
        {description && (
          <Text c="dimmed" ta="center" maw={420}>
            {description}
          </Text>
        )}
        {renderActionButton()}
        {children}
      </Stack>
    </Center>
  );
};

export default EmptyState;
