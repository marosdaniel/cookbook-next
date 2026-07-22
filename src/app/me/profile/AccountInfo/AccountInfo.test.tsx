import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import type { ProfileUser } from '../types';
import AccountInfo from './AccountInfo';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('AccountInfo', () => {
  it('renders loading skeletons when data is still loading', () => {
    render(<AccountInfo user={undefined} loading />);

    expect(screen.getByTestId('account-info-loading')).toBeInTheDocument();
  });

  it('renders the role, creation date and update date', () => {
    const user: ProfileUser = {
      id: 'user-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      userName: 'ada',
      email: 'ada@example.com',
      role: 'ADMIN',
      locale: 'en_GB',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-02-01T00:00:00.000Z',
    };

    render(<AccountInfo user={user} loading={false} />);

    expect(screen.getByTestId('account-info-content')).toBeInTheDocument();
    expect(screen.getByText('user.roleAdmin')).toBeInTheDocument();
    expect(screen.getByText('user.memberSince')).toBeInTheDocument();
  });
});
