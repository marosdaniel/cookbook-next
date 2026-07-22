import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import ProfileClient from './ProfileClient';

const mocks = vi.hoisted(() => ({
  useSession: vi.fn(),
  useQuery: vi.fn(),
  useTranslations: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => mocks.useSession(),
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: () => mocks.useQuery(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, string>) => {
    if (key === 'user.profileGreeting')
      return `profileGreeting:${values?.firstName ?? ''}`;
    return key;
  },
}));

vi.mock('./AccountInfo', () => ({
  default: ({ user }: { user?: { firstName?: string } }) => (
    <div data-testid="account-info">{user?.firstName ?? 'no-user'}</div>
  ),
}));

vi.mock('./Password', () => ({
  default: () => <div data-testid="password-panel">password-panel</div>,
}));

vi.mock('./PersonalData', () => ({
  default: ({ user }: { user?: { firstName?: string } }) => (
    <div data-testid="personal-data">{user?.firstName ?? 'no-user'}</div>
  ),
}));

describe('ProfileClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useQuery.mockReturnValue({
      data: undefined,
      loading: false,
      refetch: vi.fn(),
    });
  });

  it('renders the session-loading skeleton state', () => {
    mocks.useSession.mockReturnValue({ data: undefined, status: 'loading' });

    render(<ProfileClient />);

    expect(screen.getByTestId('profile-loading')).toBeInTheDocument();
  });

  it('renders the profile content when session is authenticated and user data is available', () => {
    mocks.useSession.mockReturnValue({
      data: { user: { id: 'user-1', firstName: 'Ada', lastName: 'Lovelace' } },
      status: 'authenticated',
    });
    mocks.useQuery.mockReturnValue({
      data: { getUserById: { firstName: 'Ada', lastName: 'Lovelace' } },
      loading: false,
      refetch: vi.fn(),
    });

    render(<ProfileClient />);

    expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    expect(screen.getByText('profileGreeting:Ada')).toBeInTheDocument();
    expect(screen.getByTestId('personal-data')).toHaveTextContent('Ada');
    expect(screen.getByTestId('account-info')).toHaveTextContent('Ada');
    expect(screen.getByTestId('password-panel')).toBeInTheDocument();
  });

  it('renders the initial loading skeleton while user data is still loading', () => {
    mocks.useSession.mockReturnValue({
      data: { user: { id: 'user-1', firstName: 'Ada', lastName: 'Lovelace' } },
      status: 'authenticated',
    });
    mocks.useQuery.mockReturnValue({
      data: undefined,
      loading: true,
      refetch: vi.fn(),
    });

    render(<ProfileClient />);

    expect(screen.getByTestId('profile-initial-loading')).toBeInTheDocument();
  });
});
