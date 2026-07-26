'use client';

import { Box, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { LayoutGroup, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { MOTION_TRANSITION } from '../../../../lib/motion/transitions';
import classes from '../RecipeDetail.module.css';
import type { RecipeStepsProps } from '../types';

export const RecipeSteps = ({ steps }: Readonly<RecipeStepsProps>) => {
  const translate = useTranslations('recipeDetail');
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  const sortedSteps = useMemo(
    () =>
      [...steps].sort(
        (firstStep, secondStep) => firstStep.order - secondStep.order,
      ),
    [steps],
  );

  const handleStepClick = (index: number) => {
    setActiveStepIndex((currentIndex) =>
      currentIndex === index ? null : index,
    );
  };

  return (
    <Box data-testid="recipe-steps">
      <Group justify="space-between" mb="lg">
        <Title order={2} size="h3" data-testid="recipe-steps-title">
          {translate('preparationSteps')}
        </Title>
      </Group>

      <LayoutGroup id="recipe-detail-steps">
        <Stack gap="lg">
          {sortedSteps.map((step, index) => {
            const isActive = activeStepIndex === index;

            return (
              <Paper
                key={step.localId || `step-${index}`}
                component="button"
                type="button"
                p="lg"
                radius="md"
                withBorder
                className={classes.stepCard}
                onClick={() => handleStepClick(index)}
                aria-pressed={isActive}
                data-testid={`recipe-step-${step.localId}`}
                style={{
                  position: 'relative',
                  width: '100%',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="recipe-detail-active-step"
                    transition={MOTION_TRANSITION.interactive}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 0,
                      borderRadius: 'var(--mantine-radius-md)',
                      backgroundColor: 'rgba(230, 245, 255, 0.4)',
                    }}
                  />
                )}

                <span
                  className={classes.stepWatermark}
                  style={{
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {index + 1}
                </span>

                <Box
                  className={classes.stepContent}
                  style={{
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <Text size="md" lh={1.7}>
                    {step.description}
                  </Text>
                </Box>
              </Paper>
            );
          })}
        </Stack>
      </LayoutGroup>
    </Box>
  );
};
