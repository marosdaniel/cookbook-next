import {
  ActionIcon,
  Autocomplete,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconChefHat,
  IconPlus,
  IconToolsKitchen2,
  IconTrash,
} from '@tabler/icons-react';
import { useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import { useFormikError } from '../../hooks/useFormikError';
import type { RecipeFormValues } from '../../types';
import type { IngredientsSectionProps } from './types';

const IngredientsSection = ({
  unitSuggestions,
  onAdd,
  onBack,
  onNext,
}: Readonly<IngredientsSectionProps>) => {
  const translate = useTranslations('recipeComposer.sections.ingredients');
  const { values, setFieldValue } = useFormikContext<RecipeFormValues>();
  const { getFieldError, revalidateOnChange } = useFormikError();

  const removeIngredient = (idx: number) => {
    const next = values.ingredients.filter((_, i) => i !== idx);
    setFieldValue('ingredients', next);
  };

  return (
    <Paper p={{ base: 'md', sm: 'xl' }} radius="lg" withBorder shadow="sm">
      <Stack gap="lg">
        <Group justify="space-between" align="baseline">
          <Group gap="xs">
            <ThemeIcon
              size={32}
              radius="md"
              variant="gradient"
              gradient={{ from: 'teal', to: 'lime' }}
            >
              <IconToolsKitchen2 size={18} />
            </ThemeIcon>
            <Title order={3}>{translate('title')}</Title>
          </Group>
          <Badge
            variant="light"
            color={values.ingredients.length ? 'green' : 'red'}
          >
            {translate('itemsCount', { count: values.ingredients.length })}
          </Badge>
        </Group>

        <Button
          variant="light"
          leftSection={<IconPlus size={16} />}
          onClick={onAdd}
        >
          {translate('addIngredient')}
        </Button>

        <Stack gap="xs">
          {values.ingredients.map((ing, idx) => (
            <Paper
              key={ing.localId}
              withBorder
              radius="md"
              p="sm"
              style={{
                borderLeft: ing.name.trim()
                  ? '3px solid var(--mantine-color-teal-5)'
                  : '3px solid var(--mantine-color-gray-3)',
                transition: 'border-color 0.2s ease',
              }}
            >
              <Group gap="xs" align="flex-start" wrap="nowrap">
                <TextInput
                  placeholder={translate('itemName')}
                  value={ing.name}
                  onChange={(e) => {
                    const path = `ingredients[${idx}].name`;
                    setFieldValue(path, e.target.value);
                    revalidateOnChange(path);
                  }}
                  error={getFieldError(`ingredients[${idx}].name`)}
                  style={{ flex: 2 }}
                  size="sm"
                />
                <TextInput
                  placeholder={translate('qty')}
                  value={ing.quantity}
                  onChange={(e) => {
                    const path = `ingredients[${idx}].quantity`;
                    setFieldValue(path, e.target.value);
                    revalidateOnChange(path);
                  }}
                  error={getFieldError(`ingredients[${idx}].quantity`)}
                  style={{ width: 70 }}
                  size="sm"
                />
                <Autocomplete
                  placeholder={translate('unit')}
                  data={unitSuggestions}
                  value={ing.unit}
                  onChange={(val) => {
                    const path = `ingredients[${idx}].unit`;
                    setFieldValue(path, val);
                    revalidateOnChange(path);
                  }}
                  error={getFieldError(`ingredients[${idx}].unit`)}
                  style={{ width: 100 }}
                  size="sm"
                />
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => removeIngredient(idx)}
                  mt={4}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Paper>
          ))}

          {values.ingredients.length === 0 && (
            <Paper
              withBorder
              radius="md"
              p="xl"
              style={{ borderStyle: 'dashed' }}
            >
              <Stack align="center" gap="sm">
                <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                  <IconToolsKitchen2 size={24} />
                </ThemeIcon>
                <Text c="dimmed" ta="center" size="sm">
                  {translate('noIngredients')}
                </Text>
                <Button
                  variant="light"
                  size="xs"
                  onClick={onAdd}
                  leftSection={<IconPlus size={14} />}
                >
                  {translate('addFirst')}
                </Button>
              </Stack>
            </Paper>
          )}

          {values.ingredients.length > 0 && (
            <Button
              variant="subtle"
              fullWidth
              style={{
                borderTop: '1px dashed var(--mantine-color-gray-3)',
              }}
              onClick={onAdd}
              mt={4}
            >
              <IconPlus size={16} />
            </Button>
          )}
        </Stack>

        <Group justify="space-between" mt="xs">
          <Button
            variant="subtle"
            color="gray"
            onClick={onBack}
            leftSection={<IconArrowLeft size={16} />}
          >
            {translate('back')}
          </Button>
          <Button
            variant="light"
            onClick={onNext}
            rightSection={<IconChefHat size={16} />}
          >
            {translate('next')}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

export default IngredientsSection;
