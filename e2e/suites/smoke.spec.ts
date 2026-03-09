import { test } from '@playwright/test';
import {
  shouldRenderHomePage,
  shouldRenderLoginForm,
} from '../test-cases/basic-auth-and-home.cases';

test.describe('Smoke suite', () => {
  test('TC-001: home page renders', async ({ page }) => {
    await shouldRenderHomePage(page);
  });

  test('TC-002: login form renders', async ({ page }) => {
    await shouldRenderLoginForm(page);
  });
});
