import { expect, type Page } from '@playwright/test';

export async function shouldOpenRecipeDetailPage(page: Page): Promise<void> {
  await page.goto('/recipes');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByTestId('recipe-page-root')).toBeVisible();

  // Debug: wait a bit longer for recipe carousel to load
  await page.waitForTimeout(1000);

  // Look for carousel slides which contain recipe cards
  const recipeCarouselSlide = page.getByTestId('recipe-carousel-slide').first();
  const slideCount = await recipeCarouselSlide.count();

  if (slideCount > 0) {
    // Try clicking on the carousel slide which should navigate to recipe detail
    await expect(recipeCarouselSlide).toBeVisible();
    await recipeCarouselSlide.click();

    await expect(page).toHaveURL(/\/recipes\//);
    await expect(page.getByTestId('recipe-detail-root')).toBeVisible();
    await expect(page.getByTestId('recipe-hero')).toBeVisible();
    await expect(page.getByTestId('recipe-ingredients')).toBeVisible();
    await expect(page.getByTestId('recipe-steps')).toBeVisible();
    return;
  }

  // If no recipes found, expect to see an empty state message
  await expect(page.getByText(/no recipes|no results/i)).toBeVisible();
}
