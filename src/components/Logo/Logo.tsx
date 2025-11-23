import { Button, Title } from '@mantine/core';
import cx from 'clsx';
import RouterLink from 'next/link';
import { useGlobal } from '../../lib/store';
import classes from './Logo.module.css';
import type { LogoProps } from './types';

const Logo = ({ headingSize }: LogoProps) => {
  const { isDarkMode } = useGlobal();

  const buttonClasses = cx({
    [classes.dark]: isDarkMode,
  });

  return (
    <Button
      component={RouterLink}
      href="/"
      variant="white"
      className={buttonClasses}
    >
      <Title c="pink.7" order={headingSize || 2}>
        CookBook
      </Title>
    </Button>
  );
};

export default Logo;
