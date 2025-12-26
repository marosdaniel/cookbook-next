'use client';

import { Button } from '@mantine/core';
import Link from 'next/link';
import classes from './NavButton.module.css';
import type { NavButtonProps } from './types';

const NavButton = ({
  label,
  href,
  icon,
  size = 'lg',
  fullWidth = false,
}: NavButtonProps) => {
  return (
    <Button
      component={Link}
      href={href}
      size={size}
      variant="gradient"
      gradient={{ from: 'pink', to: 'violet', deg: 45 }}
      leftSection={icon}
      className={classes.navButton}
      fullWidth={fullWidth}
    >
      {label}
    </Button>
  );
};

export default NavButton;
