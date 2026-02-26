'use client';

import { Container, Text } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { FiArrowLeft } from 'react-icons/fi';
import { GiCookingPot } from 'react-icons/gi';
import NavButton from '../buttons/NavButton';
import StyledText from '../StyledText';
import classes from './UnderConstruction.module.css';

const UnderConstruction = () => {
  const translate = useTranslations('underConstruction');

  return (
    <Container className={classes.container}>
      <div className={classes.iconWrapper}>
        <svg width="0" height="0">
          <title>{translate('gradientIconTitle')}</title>
          <linearGradient id="pot-gradient" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop stopColor="var(--mantine-color-pink-6)" offset="0%" />
            <stop stopColor="var(--mantine-color-violet-6)" offset="100%" />
          </linearGradient>
        </svg>
        <GiCookingPot style={{ fill: 'url(#pot-gradient)' }} />
      </div>
      <StyledText
        componentType="title"
        gradient
        className={classes.title}
        order={1}
      >
        {translate('title')}
      </StyledText>
      <Text size="xl" fw={500} mt="md" mb="xs">
        {translate('subtitle')}
      </Text>
      <Text c="dimmed" size="lg" maw={600} mx="auto" mb={40}>
        {translate('description')}
      </Text>

      <NavButton
        label={translate('backButton')}
        href="/"
        icon={<FiArrowLeft size={20} />}
      />
    </Container>
  );
};

export default UnderConstruction;
