import type { useTranslations } from 'next-intl';
import type { ComposerSection, RecipeFormValues } from '../../types';

export const getSectionHint = (
  section: ComposerSection,
  completion: { done: number; total: number },
  values: RecipeFormValues,
  t: ReturnType<typeof useTranslations>,
) => {
  switch (section) {
    case 'ingredients':
      return t('itemsCount', { count: values.ingredients.length });

    case 'steps':
      return t('stepsCount', {
        count: values.preparationSteps.length,
      });

    case 'media':
      return values.imgSrc ? t('mediaCoverSet') : t('mediaOptional');

    case 'basics':
      return t('fieldsFilled', {
        completed: completion.done,
        total: completion.total,
      });
  }
};
