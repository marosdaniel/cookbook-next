'use client';

import { Box, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import classes from '../RecipeDetail.module.css';
import type { RecipeStepsProps } from '../types';

export const RecipeSteps = ({ steps }: Readonly<RecipeStepsProps>) => {
  const translate = useTranslations('recipeDetail');
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <Box>
      <Group justify="space-between" mb="lg">
        <Title order={2} size="h3">
          {translate('preparationSteps')}
        </Title>
      </Group>
      <Stack gap="lg">
        {steps.map((step) => {
          const isActive = activeStep === step.order;
          const isCompleted = activeStep !== null && step.order < activeStep;

          return (
            <Paper
              key={step.order}
              p="lg"
              radius="md"
              withBorder
              className={classes.stepCard}
              style={{
                position: 'relative',
                cursor: 'pointer',
                opacity: isCompleted ? 0.6 : 1,
              }}
              onClick={() => setActiveStep(step.order)}
            >
              {isActive && (
                <motion.div
                  layoutId="active-step-bg"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'var(--mantine-radius-md)',
                    backgroundColor: 'rgba(230, 245, 255, 0.4)',
                    zIndex: 0,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span
                className={classes.stepWatermark}
                style={{ position: 'relative', zIndex: 1 }}
              >
                {step.order}
              </span>
              <Box
                className={classes.stepContent}
                style={{ position: 'relative', zIndex: 1 }}
              >
                <Text
                  size="md"
                  lh={1.7}
                  td={isCompleted ? 'line-through' : 'none'}
                >
                  {step.description}
                </Text>
              </Box>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};
