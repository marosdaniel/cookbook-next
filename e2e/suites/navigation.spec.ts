import { test } from '@playwright/test';
import {
  shouldNavigateToCookiePolicyPage,
  shouldNavigateToLoginFromPrivacyPolicy,
  shouldNavigateToRecipesPage,
  shouldRedirectLoginToHomeAfterVisit,
} from '../test-cases/navigation.cases';

test.describe('Navigation suite', () => {
  test('TC-007: can navigate to recipes page', async ({ page }) => {
    await shouldNavigateToRecipesPage(page);
  });

  test('TC-008: can navigate to privacy policy page', async ({ page }) => {
    await shouldNavigateToLoginFromPrivacyPolicy(page);
  });

  test('TC-009: can navigate to cookie policy page', async ({ page }) => {
    await shouldNavigateToCookiePolicyPage(page);
  });

  test('TC-010: can navigate back to home from login page', async ({
    page,
  }) => {
    await shouldRedirectLoginToHomeAfterVisit(page);
  });
});
