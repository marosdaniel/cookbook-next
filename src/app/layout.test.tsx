import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';

const { mockConnection, mockGetLocaleFromCookies, mockGetLocaleMessages } =
  vi.hoisted(() => ({
    mockConnection: vi.fn(),
    mockGetLocaleFromCookies: vi.fn(),
    mockGetLocaleMessages: vi.fn(),
  }));

vi.mock('next/server', () => ({
  connection: mockConnection,
}));

vi.mock('@/lib/locale/locale.server', () => ({
  getLocaleFromCookies: mockGetLocaleFromCookies,
}));

vi.mock('@/lib/locale/locale', () => ({
  getLocaleMessages: mockGetLocaleMessages,
}));

vi.mock('@/providers/server', () => ({
  ServerProviders: ({ children }: { children: ReactNode }) => (
    <div data-testid="server-providers">{children}</div>
  ),
}));

vi.mock('next/dynamic', () => ({
  default: () => {
    const Component = ({ children }: { children: ReactNode }) => (
      <div data-testid="client-providers">{children}</div>
    );
    return Component;
  },
}));

vi.mock('@/components/Shell', () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="shell">{children}</div>
  ),
}));

vi.mock('@vercel/speed-insights/next', () => ({
  SpeedInsights: () => <div data-testid="speed-insights" />,
}));

import type { ReactNode } from 'react';
import RootLayout, { generateMetadata } from './layout';

describe('RootLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConnection.mockResolvedValue(undefined);
    mockGetLocaleFromCookies.mockResolvedValue('hu');
    mockGetLocaleMessages.mockImplementation(async (locale: string) => ({
      seo: {
        appTitle: `App ${locale}`,
        appDescription: 'Description',
      },
    }));
  });

  it('renders the app shell with providers and children', async () => {
    const ui = await RootLayout({ children: <div>content</div> });
    render(ui);

    expect(screen.getByTestId('server-providers')).toBeInTheDocument();
    expect(screen.getByTestId('client-providers')).toBeInTheDocument();
    expect(screen.getByTestId('shell')).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
    expect(mockGetLocaleMessages).toHaveBeenCalledTimes(1);
    expect(mockGetLocaleMessages).toHaveBeenCalledWith('hu');
  });

  it('builds metadata from locale messages', async () => {
    const metadata = await generateMetadata();

    expect(mockConnection).toHaveBeenCalled();
    expect(mockGetLocaleFromCookies).toHaveBeenCalled();
    expect(mockGetLocaleMessages).toHaveBeenCalledWith('hu');
    expect(metadata.title).toBe('App hu');
    expect(metadata.description).toBe('Description');
    expect(metadata.metadataBase?.toString()).toBe('http://localhost:3000/');
  });

  it('uses the configured public site URL for metadata', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://cookbook.example.com');

    const metadata = await generateMetadata();

    expect(metadata.metadataBase?.toString()).toBe(
      'https://cookbook.example.com/',
    );
  });
});
