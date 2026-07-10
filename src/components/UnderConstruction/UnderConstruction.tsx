'use client';

import { Container, Group, Text } from '@mantine/core';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { FiArrowLeft, FiBookOpen } from 'react-icons/fi';
import { GiCookingPot } from 'react-icons/gi';
import NavButton from '../buttons/NavButton';
import StyledText from '../StyledText';
import classes from './UnderConstruction.module.css';

const UnderConstruction = () => {
  const translate = useTranslations('underConstruction');
  const shouldReduceMotion = useReducedMotion();

  return (
    <Container
      size="sm"
      className={classes.container}
      data-testid="underconstruction-container"
    >
      <svg width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="pot-gradient" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop stopColor="var(--mantine-color-pink-6)" offset="0%" />
            <stop stopColor="var(--mantine-color-violet-6)" offset="100%" />
          </linearGradient>
        </defs>
      </svg>

      <motion.div
        className={classes.iconWrapper}
        initial={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 16, rotate: -4 }
        }
        animate={
          shouldReduceMotion
            ? { opacity: 1 }
            : {
                opacity: 1,
                y: [0, -10, 0],
                rotate: [0, 2, 0],
              }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0.16 }
            : {
                opacity: { duration: 0.28, ease: 'easeOut' },
                y: {
                  duration: 3.5,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatType: 'mirror',
                },
                rotate: {
                  duration: 3.5,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatType: 'mirror',
                },
              }
        }
      >
        <GiCookingPot
          aria-hidden="true"
          style={{ fill: 'url(#pot-gradient)' }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.06, ease: 'easeOut' }}
      >
        <StyledText
          componentType="title"
          gradient
          className={classes.title}
          order={1}
        >
          <span data-testid="underconstruction-title">
            {translate('title')}
          </span>
        </StyledText>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.1, ease: 'easeOut' }}
      >
        <Text
          size="xl"
          fw={500}
          mt="md"
          mb="xs"
          data-testid="underconstruction-subtitle"
        >
          {translate('subtitle')}
        </Text>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.14, ease: 'easeOut' }}
      >
        <Text
          c="dimmed"
          size="lg"
          maw={600}
          mx="auto"
          mb={40}
          data-testid="underconstruction-description"
        >
          {translate('description')}
        </Text>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.18, ease: 'easeOut' }}
      >
        <Group justify="center" gap="sm">
          <NavButton
            label={translate('backButton')}
            href="/"
            icon={<FiArrowLeft size={20} />}
            dataTestId="underconstruction-back"
          />

          <NavButton
            label={translate('browseRecipes')}
            href="/recipes"
            icon={<FiBookOpen size={20} />}
            dataTestId="underconstruction-recipes"
          />
        </Group>
      </motion.div>
    </Container>
  );
};

export default UnderConstruction;
