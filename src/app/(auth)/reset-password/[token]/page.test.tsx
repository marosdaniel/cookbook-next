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

vi.mock('./SetNewPasswordForm', () => ({
  SetNewPasswordForm: () => <div data-testid="set-new-password-form" />,
}));

import SetNewPasswordPage, { generateMetadata } from './page';

describe('SetNewPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the set new password form', () => {
    const { container } = render(<SetNewPasswordPage />);

    expect(container).toBeTruthy();
  });

  it('builds metadata with the expected fallback values', async () => {
    mockGetLocaleFromCookies.mockResolvedValue('en-gb');
    mockGetMetadata.mockResolvedValue({ title: 'Set New Password' });

    await generateMetadata();

    expect(mockGetMetadata).toHaveBeenCalledWith(
      'en-gb',
      'seo',
      expect.objectContaining({
        titleKey: 'resetPasswordTitle',
        descriptionKey: 'resetPasswordDescription',
        fallbackTitle: 'Set New Password',
        fallbackDescription: 'Enter your new password',
        robots: { index: false, follow: false },
      }),
    );
  });
});
