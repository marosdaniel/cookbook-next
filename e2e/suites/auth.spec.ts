import { test } from '@playwright/test';
import {
  shouldKeepLoginButtonDisabledWhileSubmitting,
  shouldNavigateToResetPasswordFromLoginPage,
  shouldNavigateToSignUpFromLoginPage,
  shouldShowValidationErrorOnEmptyLoginSubmit,
} from '../test-cases/login.cases';
import {
  shouldNavigateToLoginFromResetPasswordPage,
  shouldRenderResetPasswordForm,
} from '../test-cases/reset-password.cases';
import {
  shouldHaveLoginLinkOnSignUpPage,
  shouldRenderSignUpForm,
} from '../test-cases/signup.cases';

test.describe('Auth suite – signup', () => {
  test('TC-003: signup form renders', async ({ page }) => {
    await shouldRenderSignUpForm(page);
  });

  test('TC-004: signup page has link back to login', async ({ page }) => {
    await shouldHaveLoginLinkOnSignUpPage(page);
  });
});

test.describe('Auth suite – login', () => {
  test('TC-011: login page links to signup', async ({ page }) => {
    await shouldNavigateToSignUpFromLoginPage(page);
  });

  test('TC-012: login page links to reset password', async ({ page }) => {
    await shouldNavigateToResetPasswordFromLoginPage(page);
  });

  test('TC-013: empty login submit keeps user on login page', async ({
    page,
  }) => {
    await shouldShowValidationErrorOnEmptyLoginSubmit(page);
  });

  test('TC-014: login button is enabled on page load', async ({ page }) => {
    await shouldKeepLoginButtonDisabledWhileSubmitting(page);
  });
});

test.describe('Auth suite – reset password', () => {
  test('TC-015: reset password form renders', async ({ page }) => {
    await shouldRenderResetPasswordForm(page);
  });

  test('TC-016: can navigate back to login from reset password page', async ({
    page,
  }) => {
    await shouldNavigateToLoginFromResetPasswordPage(page);
  });
});
