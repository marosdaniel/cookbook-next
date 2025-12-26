'use client';

import { Text, type TextProps, Title, type TitleProps } from '@mantine/core';
import clsx from 'clsx';
import classes from './StyledText.module.css';
import type { StyledTextProps } from './types';

export function StyledText<C extends 'title' | 'text' = 'text'>({
  componentType = 'text' as C,
  gradient = false,
  className,
  ...props
}: StyledTextProps<C>) {
  const combinedClassName = clsx(className, {
    [classes.gradientText]: gradient,
  });

  if (componentType === 'title') {
    return <Title className={combinedClassName} {...(props as TitleProps)} />;
  }

  return <Text className={combinedClassName} {...(props as TextProps)} />;
}

export default StyledText;
