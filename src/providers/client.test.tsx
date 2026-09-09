import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ClientProviders from './client';

const { mockDispatch, mockStore } = vi.hoisted(() => ({
  mockDispatch: vi.fn(),
  mockStore: {},
}));

vi.mock('react-redux', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="redux-provider">{children}</div>
  ),
  useDispatch: () => mockDispatch,
}));
vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
}));
vi.mock('@apollo/client/react', () => ({
  ApolloProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="apollo-provider">{children}</div>
  ),
}));
vi.mock('motion/react', () => ({
  MotionConfig: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="motion-config">{children}</div>
  ),
}));
vi.mock('next-intl', () => ({
  NextIntlClientProvider: ({
    children,
    locale,
    messages,
    timeZone,
  }: {
    children: React.ReactNode;
    locale: string;
    messages: unknown;
    timeZone: string;
  }) => (
    <div
      data-testid="intl-provider"
      data-locale={locale}
      data-messages={JSON.stringify(messages)}
      data-time-zone={timeZone}
    >
      {children}
    </div>
  ),
}));
vi.mock('./mantine/mantine', () => ({
  MantineProviderWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mantine-provider">{children}</div>
  ),
}));
vi.mock('@/lib/apollo/client', () => ({ apolloClient: {} }));
vi.mock('@/lib/store', () => ({ store: mockStore }));
vi.mock('@/lib/store/global', () => ({
  setLocale: (locale: string) => ({ type: 'setLocale', payload: locale }),
}));

describe('ClientProviders', () => {
  beforeEach(() => vi.clearAllMocks());

  it('composes all providers and dispatches a supplied locale', async () => {
    render(
      <ClientProviders locale="hu" messages={{ greeting: 'Szia' }}>
        <div data-testid="client-child">Content</div>
      </ClientProviders>,
    );

    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
    expect(screen.getByTestId('apollo-provider')).toBeInTheDocument();
    expect(screen.getByTestId('redux-provider')).toBeInTheDocument();
    expect(screen.getByTestId('motion-config')).toBeInTheDocument();
    expect(screen.getByTestId('mantine-provider')).toBeInTheDocument();
    expect(screen.getByTestId('client-child')).toHaveTextContent('Content');
    expect(screen.getByTestId('intl-provider')).toHaveAttribute(
      'data-locale',
      'hu',
    );
    expect(screen.getByTestId('intl-provider')).toHaveAttribute(
      'data-time-zone',
      'Europe/Budapest',
    );
    await waitFor(() =>
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'setLocale',
        payload: 'hu',
      }),
    );
  });

  it('does not dispatch when locale is absent', async () => {
    render(
      <ClientProviders messages={{}}>
        <span>Content</span>
      </ClientProviders>,
    );

    await waitFor(() => expect(mockDispatch).not.toHaveBeenCalled());
  });
});
