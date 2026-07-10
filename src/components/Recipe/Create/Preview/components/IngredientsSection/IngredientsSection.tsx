import { Badge, Box, Checkbox, Group, Paper, Text, Title } from '@mantine/core';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { MOTION_TRANSITION } from '../../../../../../lib/motion/transitions';
import type { IngredientRowProps, IngredientsSectionProps } from './types';

const IngredientsSection = ({ ingredients }: IngredientsSectionProps) => {
  const t = useTranslations('recipePreview');

  return (
    <Box>
      <Title order={3} mb="md">
        {t('ingredients.title')}
      </Title>

      {ingredients.length > 0 ? (
        <Paper withBorder radius="md" p={0} style={{ overflow: 'hidden' }}>
          <AnimatePresence initial={false} mode="popLayout">
            {ingredients.map((ingredient, index) => (
              <IngredientRow
                key={ingredient.localId}
                ingredient={ingredient}
                isLast={index === ingredients.length - 1}
                isEven={index % 2 === 0}
              />
            ))}
          </AnimatePresence>
        </Paper>
      ) : (
        <Text c="dimmed" size="sm" fs="italic">
          {t('ingredients.noIngredients')}
        </Text>
      )}
    </Box>
  );
};

const IngredientRow = ({ ingredient, isLast, isEven }: IngredientRowProps) => {
  const t = useTranslations('recipePreview');

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: ingredient.isOptional ? 0.6 : 1,
        y: 0,
      }}
      exit={{ opacity: 0, x: -12 }}
      transition={MOTION_TRANSITION.standard}
    >
      <Box
        p="sm"
        style={{
          borderBottom: isLast
            ? 'none'
            : '1px solid var(--mantine-color-gray-2)',
          backgroundColor: isEven
            ? 'var(--mantine-color-gray-0)'
            : 'transparent',
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <Checkbox
              color="orange"
              tabIndex={-1}
              style={{ cursor: 'default' }}
              readOnly
            />

            <Text fw={500}>
              {ingredient.name}

              {ingredient.isOptional && (
                <Text span size="xs" c="dimmed" ml={4}>
                  {t('optional')}
                </Text>
              )}
            </Text>
          </Group>

          <Badge variant="light" color="gray" size="sm">
            {ingredient.quantity} {ingredient.unit}
          </Badge>
        </Group>

        {ingredient.note && (
          <Text size="xs" c="dimmed" mt={2} ml={36} fs="italic">
            {ingredient.note}
          </Text>
        )}
      </Box>
    </motion.div>
  );
};

export default IngredientsSection;
