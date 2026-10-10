import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getMetadata: vi.fn(),
}));

vi.mock('@/lib/auth/auth', () => ({ auth: mocks.auth }));

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

vi.mock('@/lib/locale/locale.server', () => ({
  getLocaleFromCookies: vi.fn().mockResolvedValue('en-gb'),
}));

vi.mock('@/lib/seo/seo', () => ({
  getMetadata: mocks.getMetadata,
}));

vi.mock('./AdminShell', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="admin-shell">{children}</div>
  ),
}));

import AdminLayout, { generateMetadata } from './layout';

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMetadata.mockResolvedValue({ title: 'Admin | Cookbook' });
  });

  it('redirects anonymous visitors to login with a callback', async () => {
    mocks.auth.mockResolvedValue(null);

    await expect(AdminLayout({ children: <p>secret</p> })).rejects.toThrow(
      'REDIRECT:/login?callbackUrl=%2Fadmin',
    );
  });

  it('redirects signed-in users without the admin role home', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'u1', role: 'USER' } });

    await expect(AdminLayout({ children: <p>secret</p> })).rejects.toThrow(
      'REDIRECT:/',
    );
  });

  it('renders the admin shell for admins', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'a1', role: 'ADMIN' } });

    const element = await AdminLayout({ children: <p>admin content</p> });
    render(element);

    expect(screen.getByTestId('admin-shell')).toBeInTheDocument();
    expect(screen.getByText('admin content')).toBeInTheDocument();
  });

  it('marks admin pages as non-indexable', async () => {
    await generateMetadata();

    expect(mocks.getMetadata).toHaveBeenCalledWith(
      'en-gb',
      'seo',
      expect.objectContaining({
        titleKey: 'adminTitle',
        robots: { index: false, follow: false },
      }),
    );
  });
});
