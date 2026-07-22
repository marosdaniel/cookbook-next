import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RecipeFormProvider, useRecipeFormContext } from './FormContext';

describe('Recipe form context', () => {
  it('exposes the form through the hook inside the provider', () => {
    const form = {
      values: {
        title: 'Test',
        description: '',
        imgSrc: '',
        servings: 4,
        cookingTime: 30,
        difficultyLevel: null,
        category: null,
        labels: [],
        youtubeLink: '',
        ingredients: [],
        preparationSteps: [],
        prepTimeMinutes: 10,
        cookTimeMinutes: 15,
        restTimeMinutes: 5,
        servingUnit: null,
        cuisine: null,
        dietaryFlags: [],
        allergens: [],
        equipment: [],
        costLevel: null,
        tips: '',
        substitutions: '',
        slug: '',
        seoTitle: '',
        seoDescription: '',
        socialImage: '',
      },
    } as never;

    const Consumer = () => {
      const context = useRecipeFormContext();
      return (
        <div data-testid="context-value">{String(context.values.title)}</div>
      );
    };

    const { getByTestId } = render(
      <RecipeFormProvider form={form}>
        <Consumer />
      </RecipeFormProvider>,
    );

    expect(getByTestId('context-value').textContent).toBe('Test');
  });
});
