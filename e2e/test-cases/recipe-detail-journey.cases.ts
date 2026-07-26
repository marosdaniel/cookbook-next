import { expect, type Page } from '@playwright/test';

export async function shouldOpenRecipeDetailPage(page: Page): Promise<void> {
  await page.goto('/recipes');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByTestId('recipe-page-root')).toBeVisible();

  await page.waitForFunction(() => {
    return (
      document.querySelector('[data-testid="recipe-carousel-slide"]') !==
        null ||
      document.querySelector('[data-testid="recipe-carousel-empty"]') !== null
    );
  });

  const recipeCarouselSlide = page.getByTestId('recipe-carousel-slide').first();
  const slideCount = await recipeCarouselSlide.count();

  if (slideCount > 0) {
    await expect(recipeCarouselSlide).toBeVisible();
    await recipeCarouselSlide.click();

    await expect(page).toHaveURL(/\/recipes\//);
    await expect(page.getByTestId('recipe-detail-root')).toBeVisible();
    await expect(page.getByTestId('recipe-hero')).toBeVisible();
    await expect(page.getByTestId('recipe-ingredients')).toBeVisible();
    await expect(page.getByTestId('recipe-steps')).toBeVisible();
    return;
  }

  await expect(page.getByTestId('recipe-carousel-empty')).toBeVisible();
}
