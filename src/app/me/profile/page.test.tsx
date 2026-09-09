import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import ProfilePage, { generateMetadata } from './page';

const mocks = vi.hoisted(() => ({
  getLocaleFromCookies: vi.fn(),
  getMetadata: vi.fn(),
  profileClient: vi.fn(),
}));

vi.mock('@/lib/locale/locale.server', () => ({
  getLocaleFromCookies: mocks.getLocaleFromCookies,
}));
vi.mock('@/lib/seo/seo', () => ({ getMetadata: mocks.getMetadata }));
vi.mock('./ProfileClient', () => ({
  default: () => <div data-testid="profile-client">Profile client</div>,
}));

describe('ProfilePage', () => {
  it('renders the profile client', () => {
    render(<ProfilePage />);

    expect(screen.getByTestId('profile-client')).toBeInTheDocument();
  });

  it('generates private profile metadata using the cookie locale', async () => {
    mocks.getLocaleFromCookies.mockResolvedValue('hu');
    mocks.getMetadata.mockResolvedValue({ title: 'Profile | Cookbook' });

    const metadata = await generateMetadata();

    expect(mocks.getLocaleFromCookies).toHaveBeenCalledOnce();
    expect(mocks.getMetadata).toHaveBeenCalledWith('hu', 'seo', {
      titleKey: 'profileTitle',
      descriptionKey: 'profileDescription',
      fallbackTitle: 'Profile',
      fallbackDescription: 'Manage your profile',
      robots: { index: false, follow: false },
    });
    expect(metadata).toEqual({ title: 'Profile | Cookbook' });
  });
});
