import { test } from '@playwright/test';
import {
  shouldNavigateHomeFromNotFoundPage,
  shouldRenderNotFoundPage,
} from '../test-cases/not-found.cases';

test.describe('Not found suite', () => {
  test('TC-005: 404 page renders for unknown route', async ({ page }) => {
    await shouldRenderNotFoundPage(page);
  });

  test('TC-006: back-home link navigates to home', async ({ page }) => {
    await shouldNavigateHomeFromNotFoundPage(page);
  });
});
