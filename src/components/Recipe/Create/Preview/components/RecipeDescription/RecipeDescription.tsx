import { Text } from '@mantine/core';
import { useTranslations } from 'next-intl';
import type { RecipeDescriptionProps } from './types';

const RecipeDescription = ({ description }: RecipeDescriptionProps) => {
  const translate = useTranslations('recipePreview');

  if (!description?.trim()) {
    return (
      <Text c="dimmed" fs="italic" opacity={0.5} mb="xl">
        {translate('description.placeholder')}
      </Text>
    );
  }

  return (
    <Text
      size="lg"
      lh={1.6}
      c="dimmed"
      mb="xl"
      data-testid="recipe-preview-description"
      style={{ whiteSpace: 'pre-wrap' }}
    >
      {description}
    </Text>
  );
};
export default RecipeDescription;
