import {
  ActionIcon,
  Box,
  Checkbox,
  Group,
  NumberInput,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import classes from '../RecipeDetail.module.css';
import type { RecipeIngredientsProps } from '../types';
import { scaleQuantity } from '../utils';

const SERVING_MIN = 1;
const SERVING_MAX = 20;

export function RecipeIngredients({
  ingredients,
  servingMultiplier,
  adjustedServings,
  checkedIngredients,
  onToggleIngredient,
  onIncrementServings,
  onDecrementServings,
}: Readonly<RecipeIngredientsProps>) {
  const translate = useTranslations('recipeDetail');

  return (
    <Paper p="lg" radius="md" withBorder className={classes.ingredientsCard}>
      <Group justify="space-between" mb="md">
        <Title order={2} size="h3" c="pink">
          {translate('ingredients')}
        </Title>
        <Text size="xs" c="dimmed">
          {translate('checkedOff', {
            count: checkedIngredients.size,
            total: ingredients.length,
          })}
        </Text>
      </Group>

      {/* Serving adjuster */}
      <Group gap="xs" mb="lg" justify="center">
        <Text fw={700} size="sm" tt="uppercase">
          {translate('servings')}:
        </Text>
        <ActionIcon
          variant="filled"
          color="pink"
          size="sm"
          onClick={onDecrementServings}
          disabled={servingMultiplier <= SERVING_MIN}
          aria-label="Decrease servings"
        >
          <IconMinus size={14} />
        </ActionIcon>
        <NumberInput
          value={adjustedServings}
          readOnly
          hideControls
          w={50}
          size="xs"
          styles={{ input: { textAlign: 'center', fontWeight: 700 } }}
        />
        <ActionIcon
          variant="filled"
          color="pink"
          size="sm"
          onClick={onIncrementServings}
          disabled={servingMultiplier >= SERVING_MAX}
          aria-label="Increase servings"
        >
          <IconPlus size={14} />
        </ActionIcon>
      </Group>

      {/* Ingredient list */}
      <Stack gap={0}>
        {ingredients.map((ing) => {
          const checked = checkedIngredients.has(ing.localId);
          const scaledQty = scaleQuantity(ing.quantity, servingMultiplier);
          return (
            <Box
              key={ing.localId}
              className={`${classes.ingredientItem} ${checked ? classes.ingredientChecked : ''}`}
              onClick={() => onToggleIngredient(ing.localId)}
            >
              <Checkbox
                checked={checked}
                onChange={() => onToggleIngredient(ing.localId)}
                color="pink"
                size="sm"
                tabIndex={-1}
                aria-label={ing.name}
              />
              <Text
                size="sm"
                className={`${classes.ingredientText} ${checked ? classes.ingredientTextChecked : ''}`}
              >
                <Text component="span" fw={700}>
                  {scaledQty} {ing.unit}
                </Text>{' '}
                {ing.name}
              </Text>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}
