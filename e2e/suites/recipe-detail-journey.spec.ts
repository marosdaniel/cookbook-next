import { test } from '@playwright/test';
import { shouldOpenRecipeDetailPage } from '../test-cases/recipe-detail-journey.cases';

test.describe('Recipe detail journey suite', () => {
  test('TC-015: can open a recipe detail page from the recipes list', async ({
    page,
  }) => {
    await shouldOpenRecipeDetailPage(page);
  });
});
