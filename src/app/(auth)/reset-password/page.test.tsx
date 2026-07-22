import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@/utils/test-utils';

const { mockGetLocaleFromCookies, mockGetMetadata } = vi.hoisted(() => ({
  mockGetLocaleFromCookies: vi.fn(),
  mockGetMetadata: vi.fn(),
}));

vi.mock('@/lib/locale/locale.server', () => ({
  getLocaleFromCookies: mockGetLocaleFromCookies,
}));

vi.mock('@/lib/seo/seo', () => ({
  getMetadata: mockGetMetadata,
}));

vi.mock('./ResetPasswordForm', () => ({
  ResetPasswordForm: () => <div data-testid="reset-password-form" />,
}));

import ResetPasswordPage, { generateMetadata } from './page';

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the reset password form', () => {
    const { container } = render(<ResetPasswordPage />);

    expect(container).toBeTruthy();
  });

  it('builds metadata with the expected fallback values', async () => {
    mockGetLocaleFromCookies.mockResolvedValue('en-gb');
    mockGetMetadata.mockResolvedValue({ title: 'Forgot Password' });

    await generateMetadata();

    expect(mockGetMetadata).toHaveBeenCalledWith(
      'en-gb',
      'seo',
      expect.objectContaining({
        titleKey: 'forgotPasswordTitle',
        descriptionKey: 'forgotPasswordDescription',
        fallbackTitle: 'Forgot Password',
        fallbackDescription: 'Reset your password',
        robots: { index: false, follow: false },
      }),
    );
  });
});
