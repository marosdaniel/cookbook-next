'use client';

import { Box, Group, Paper, Stack, Text, Title } from '@mantine/core';
import {
  LayoutGroup,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';
import { MOTION_TRANSITION } from '../../../../lib/motion/transitions';
import classes from '../RecipeDetail.module.css';
import type { RecipeStepsProps } from '../types';

export const RecipeSteps = ({ steps }: Readonly<RecipeStepsProps>) => {
  const translate = useTranslations('recipeDetail');
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: stepsRef,
    offset: ['start end', 'end end'],
  });
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const sortedSteps = useMemo(
    () =>
      [...steps].sort(
        (firstStep, secondStep) => firstStep.order - secondStep.order,
      ),
    [steps],
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (sortedSteps.length === 0) return;

    const nextIndex = Math.min(
      sortedSteps.length - 1,
      Math.floor(latest * sortedSteps.length),
    );
    setCurrentStepIndex((currentIndex) =>
      currentIndex === nextIndex ? currentIndex : nextIndex,
    );
  });

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
        <Box className={classes.stepsTimeline}>
          {sortedSteps.length > 0 && (
            <Box
              className={classes.stepsProgressTrack}
              aria-hidden="true"
              data-testid="recipe-steps-progress"
            >
              {!shouldReduceMotion && (
                <motion.div
                  className={classes.stepsProgress}
                  style={{ scaleY: progress }}
                />
              )}
            </Box>
          )}
          <Box
            component="ol"
            className={classes.stepsProgressMarkers}
            aria-label={translate('stepProgress')}
          >
            {sortedSteps.map((step, index) => (
              <Box
                component="li"
                key={step.localId || `step-marker-${index}`}
                className={
                  index === currentStepIndex
                    ? classes.stepsProgressMarkerActive
                    : classes.stepsProgressMarker
                }
                aria-current={index === currentStepIndex ? 'step' : undefined}
                data-testid={`recipe-step-marker-${step.localId}`}
              >
                {index + 1}
              </Box>
            ))}
          </Box>
          <Stack ref={stepsRef} gap="lg" className={classes.stepsList}>
            {sortedSteps.map((step, index) => {
              const isActive = activeStepIndex === index;

              return (
                <motion.div
                  key={step.localId || `step-${index}`}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={
                    shouldReduceMotion ? undefined : { opacity: 1, y: 0 }
                  }
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{
                    ...MOTION_TRANSITION.standard,
                    delay: Math.min(index * 0.08, 0.4),
                  }}
                >
                  <Paper
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
                          backgroundColor: 'var(--mantine-color-meadow-1)',
                          border: '2px solid var(--mantine-color-meadow-6)',
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
                </motion.div>
              );
            })}
          </Stack>
        </Box>
      </LayoutGroup>
    </Box>
  );
};
