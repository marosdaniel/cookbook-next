'use client';

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
import { MOTION_TRANSITION } from '../../../../lib/motion/transitions';
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
  const translateIngredients = useTranslations('recipeIngredients');

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

      <Group gap="xs" mb="lg" justify="center">
        <Text fw={700} size="sm" tt="uppercase">
          {translate('servings')}:
        </Text>

        <motion.div
          whileTap={
            servingMultiplier > SERVING_MIN ? { scale: 0.9 } : undefined
          }
          transition={MOTION_TRANSITION.interactive}
        >
          <ActionIcon
            type="button"
            variant="filled"
            color="pink"
            size="sm"
            onClick={onDecrementServings}
            disabled={servingMultiplier <= SERVING_MIN}
            aria-label={translateIngredients('decreaseServings')}
          >
            <IconMinus size={14} />
          </ActionIcon>
        </motion.div>

        <NumberInput
          value={adjustedServings}
          readOnly
          hideControls
          w={50}
          size="xs"
          aria-label={translate('servings')}
          styles={{
            input: {
              textAlign: 'center',
              fontWeight: 700,
            },
          }}
        />

        <motion.div
          whileTap={
            servingMultiplier < SERVING_MAX ? { scale: 0.9 } : undefined
          }
          transition={MOTION_TRANSITION.interactive}
        >
          <ActionIcon
            type="button"
            variant="filled"
            color="pink"
            size="sm"
            onClick={onIncrementServings}
            disabled={servingMultiplier >= SERVING_MAX}
            aria-label={translateIngredients('increaseServings')}
          >
            <IconPlus size={14} />
          </ActionIcon>
        </motion.div>
      </Group>

      <Stack gap={0}>
        {ingredients.map((ingredient) => {
          const isChecked = checkedIngredients.has(ingredient.localId);
          const scaledQuantity = scaleQuantity(
            ingredient.quantity,
            servingMultiplier,
          );

          return (
            <motion.div
              key={ingredient.localId}
              layout="position"
              className={`${classes.ingredientItem} ${
                isChecked ? classes.ingredientChecked : ''
              }`}
              initial={false}
              animate={{ opacity: isChecked ? 0.5 : 1 }}
              whileHover={{ x: 2 }}
              transition={MOTION_TRANSITION.fast}
            >
              <Checkbox
                checked={isChecked}
                onChange={() => onToggleIngredient(ingredient.localId)}
                color="pink"
                size="sm"
                label={
                  <Text
                    size="sm"
                    className={`${classes.ingredientText} ${
                      isChecked ? classes.ingredientTextChecked : ''
                    }`}
                  >
                    <AnimatePresence initial={false} mode="popLayout">
                      <motion.span
                        key={String(scaledQuantity)}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={MOTION_TRANSITION.fast}
                        style={{
                          display: 'inline-block',
                          fontWeight: 700,
                        }}
                      >
                        {scaledQuantity}
                      </motion.span>
                    </AnimatePresence>
                    <Text component="span" fw={700} ml={4}>
                      {ingredient.unit}
                    </Text>{' '}
                    {ingredient.name}
                  </Text>
                }
                styles={{
                  root: {
                    width: '100%',
                  },
                  body: {
                    alignItems: 'center',
                  },
                  label: {
                    flex: 1,
                  },
                }}
              />
            </motion.div>
          );
        })}
      </Stack>
    </Paper>
  );
};
