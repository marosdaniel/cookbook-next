'use client';

import { Card, Container, Divider, ScrollArea, Stack } from '@mantine/core';
import { IconToolsKitchen2 } from '@tabler/icons-react';
import { LayoutGroup } from 'motion/react';
import { memo, useMemo } from 'react';
import type { PreviewProps } from '../types';
import IngredientsSection from './components/IngredientsSection';
import PreparationSection from './components/PreparationSection';
import RecipeDescription from './components/RecipeDescription';
import RecipeEquipment from './components/RecipeEquipment';
import RecipeHero from './components/RecipeHero';
import RecipeNotes from './components/RecipeNotes';
import RecipeStats from './components/RecipeStats';
import RecipeTags from './components/RecipeTags';

const Preview = memo(({ labels, values }: Readonly<PreviewProps>) => {
  const tags = useMemo(
    () =>
      values.labels
        .map((key) => labels.find((label) => label.value === key)?.label ?? key)
        .filter(Boolean),
    [labels, values.labels],
  );

  const sortedSteps = useMemo(
    () =>
      [...values.preparationSteps].sort(
        (firstStep, secondStep) =>
          (firstStep.order ?? 0) - (secondStep.order ?? 0),
      ),
    [values.preparationSteps],
  );

  return (
    <LayoutGroup id="recipe-preview-content">
      <Card
        radius="lg"
        p={0}
        h="100%"
        data-testid="recipe-preview"
        style={{
          minHeight: 0,
          overflow: 'hidden',
          backgroundColor: 'var(--mantine-color-body)',
          border: '1px solid var(--mantine-color-gray-2)',
          boxShadow: 'var(--mantine-shadow-sm)',
        }}
      >
        <ScrollArea h="100%" type="scroll" offsetScrollbars>
          <RecipeHero values={values} />

          <Container size="md" p={{ base: 'md', sm: 'xl' }}>
            <RecipeStats values={values} />

            <RecipeDescription description={values.description} />

            <RecipeEquipment equipment={values.equipment} />

            <Divider
              my="xl"
              label={<IconToolsKitchen2 size={16} />}
              labelPosition="center"
            />

            <Stack gap="xl">
              <IngredientsSection ingredients={values.ingredients} />

              <PreparationSection steps={sortedSteps} />
            </Stack>

            <RecipeNotes
              tips={values.tips}
              substitutions={values.substitutions}
            />

            <RecipeTags tags={tags} />
          </Container>
        </ScrollArea>
      </Card>
    </LayoutGroup>
  );
});

Preview.displayName = 'Preview';

export default Preview;
