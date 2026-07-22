import type { ButtonProps } from '@mantine/core';
import type { Route } from 'next';
import type { ReactNode } from 'react';

export type NavButtonProps = {
  label: string;
  href: Route;
  icon?: ReactNode;
  size?: ButtonProps['size'];
  fullWidth?: boolean;
  dataTestId?: string;
  linkProps?: Record<string, unknown>;
};
