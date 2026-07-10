import {
  ActionIcon,
  Checkbox,
  Group,
  NumberInput,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { MOTION_TRANSITION } from '@/lib/motion/transitions';
import classes from '../RecipeDetail.module.css';
import type { RecipeIngredientsProps } from '../types';
import { scaleQuantity } from '../utils';

const SERVING_MIN = 1;
const SERVING_MAX = 20;

export const RecipeIngredients = ({
  ingredients,
  servingMultiplier,
  adjustedServings,
  checkedIngredients,
  onToggleIngredient,
  onIncrementServings,
  onDecrementServings,
}: Readonly<RecipeIngredientsProps>) => {
  const translate = useTranslations('recipeDetail');
  const ingTranslate = useTranslations('recipeIngredients');

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
          aria-label={ingTranslate('decreaseServings')}
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
          aria-label={ingTranslate('increaseServings')}
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
            <motion.div
              layout="position"
              initial={false}
              animate={{ opacity: checked ? 0.5 : 1 }}
              transition={MOTION_TRANSITION.fast}
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
                <AnimatePresence mode="popLayout">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={MOTION_TRANSITION.fast}
                    key={scaledQty}
                    style={{ fontWeight: 700, display: 'inline-block' }}
                  >
                    {scaledQty}
                  </motion.span>
                </AnimatePresence>
                <Text component="span" fw={700} ml={4}>
                  {ing.unit}
                </Text>{' '}
                {ing.name}
              </Text>
            </motion.div>
          );
        })}
      </Stack>
    </Paper>
  );
};
