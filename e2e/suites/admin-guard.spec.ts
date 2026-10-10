import { test } from '@playwright/test';
import { shouldRedirectAnonymousVisitorFromAdmin } from '../test-cases/admin-guard.cases';

test.describe('Admin guard suite', () => {
  test('anonymous visitors are redirected from the admin area to login', async ({
    page,
  }) => {
    await shouldRedirectAnonymousVisitorFromAdmin(page);
  });
});
