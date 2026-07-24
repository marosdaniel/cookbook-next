import { expect, type Page } from '@playwright/test';

export async function shouldOpenRecipeDetailPage(page: Page): Promise<void> {
  await page.goto('/recipes');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByTestId('recipe-page-root')).toBeVisible();

  const recipeLink = page.locator('a[href^="/recipes/"]').first();

  if (await recipeLink.count()) {
    await expect(recipeLink).toBeVisible();
    await recipeLink.click();

    await expect(page).toHaveURL(/\/recipes\//);
    await expect(page.getByTestId('recipe-detail-root')).toBeVisible();
    await expect(page.getByTestId('recipe-hero')).toBeVisible();
    await expect(page.getByTestId('recipe-ingredients')).toBeVisible();
    await expect(page.getByTestId('recipe-steps')).toBeVisible();
    return;
  }

  await expect(page.getByText(/no recipes|no results/i)).toBeVisible();
}
