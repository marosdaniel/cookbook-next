import type { ButtonProps } from '@mantine/core';
import type { Route } from 'next';

export type NavButtonProps = {
  label: string;
  href: Route;
  icon?: React.ReactNode;
  size?: ButtonProps['size'];
  fullWidth?: boolean;
};
