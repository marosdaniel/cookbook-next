import { Box, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { MOTION_TRANSITION } from '../../../../../../lib/motion/transitions';
import type { PreparationSectionProps, PreparationStepProps } from './types';

const PreparationStep = ({ step, stepNumber }: PreparationStepProps) => {
  const translate = useTranslations('recipePreview');

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={MOTION_TRANSITION.standard}
    >
      <Group align="flex-start" wrap="nowrap">
        <ThemeIcon
          size={28}
          radius="50%"
          variant="gradient"
          gradient={{ from: 'orange', to: 'red' }}
          style={{ flexShrink: 0, marginTop: 4 }}
        >
          <Text size="sm" fw={700}>
            {stepNumber}
          </Text>
        </ThemeIcon>

        <Text pt={2} style={{ lineHeight: 1.6 }}>
          {step.description || (
            <Text span c="dimmed" fs="italic">
              {translate('step.describePlaceholder')}
            </Text>
          )}
        </Text>
      </Group>
    </motion.div>
  );
};

const PreparationSection = ({ steps }: PreparationSectionProps) => {
  const translate = useTranslations('recipePreview');

  return (
    <Box>
      <Title order={3} mb="md">
        {translate('preparation.title')}
      </Title>

      {steps.length > 0 ? (
        <Stack gap="lg">
          <AnimatePresence initial={false} mode="popLayout">
            {steps.map((step, index) => (
              <PreparationStep
                key={step.localId}
                step={step}
                stepNumber={index + 1}
              />
            ))}
          </AnimatePresence>
        </Stack>
      ) : (
        <Text c="dimmed" size="sm" fs="italic">
          {translate('preparation.noSteps')}
        </Text>
      )}
    </Box>
  );
};

export default PreparationSection;
