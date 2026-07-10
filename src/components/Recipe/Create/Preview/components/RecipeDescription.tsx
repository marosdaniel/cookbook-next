import { Text } from '@mantine/core';
import { useTranslations } from 'next-intl';

type RecipeDescriptionProps = {
  description?: string | null;
};

export const RecipeDescription = ({ description }: RecipeDescriptionProps) => {
  const t = useTranslations('recipePreview');

  if (!description?.trim()) {
    return (
      <Text c="dimmed" fs="italic" opacity={0.5} mb="xl">
        {t('description.placeholder')}
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
