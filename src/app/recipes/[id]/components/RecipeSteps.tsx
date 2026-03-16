import { Box, Paper, Stack, Text, Title } from '@mantine/core';
import { useTranslations } from 'next-intl';
import classes from '../RecipeDetail.module.css';
import type { RecipeStepsProps } from '../types';

export function RecipeSteps({ steps }: Readonly<RecipeStepsProps>) {
  const translate = useTranslations('recipeDetail');

  return (
    <Box>
      <Title order={2} size="h3" mb="lg">
        {translate('preparationSteps')}
      </Title>
      <Stack gap="lg">
        {steps.map((step) => (
          <Paper
            key={step.order}
            p="lg"
            radius="md"
            withBorder
            className={classes.stepCard}
          >
            <span className={classes.stepWatermark}>{step.order}</span>
            <Box className={classes.stepContent}>
              <Text size="md" lh={1.7}>
                {step.description}
              </Text>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
