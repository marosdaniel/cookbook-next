import '@testing-library/jest-dom';
import type { ChangeEvent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import type { ProfileUser } from '../types';
import PersonalData from './PersonalData';

const mocks = vi.hoisted(() => ({
  useMutation: vi.fn(),
  useTranslations: vi.fn(),
  notificationsShow: vi.fn(),
}));

vi.mock('@apollo/client/react', () => ({
  useMutation: () => mocks.useMutation(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: (...args: unknown[]) => mocks.notificationsShow(...args),
  },
}));

vi.mock('@mantine/form', () => ({
  useForm: () => {
    const values = { firstName: 'Ada', lastName: 'Lovelace' };

    return {
      getInputProps: (field: string) => ({
        value: values[field as keyof typeof values],
        onChange: (event: ChangeEvent<HTMLInputElement>) => {
          values[field as keyof typeof values] = event.target.value;
        },
      }),
      onSubmit:
        (handler: (values: Record<string, string>) => void) =>
        (event?: { preventDefault?: () => void }) => {
          event?.preventDefault?.();
          handler(values);
        },
      reset: vi.fn(),
      setValues: vi.fn(),
      resetDirty: vi.fn(),
      key: vi.fn(() => 'key'),
      isValid: () => true,
      isDirty: () => true,
    };
  },
}));

vi.mock('@/lib/validation', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/validation')>(
      '@/lib/validation',
    );
  return {
    ...actual,
    isFormSubmitDisabled: () => false,
  };
});

vi.mock('./InfoField', () => ({
  default: ({ label, value }: { label: string; value: string }) => (
    <div data-testid={`info-field-${label}`}>{value}</div>
  ),
}));

describe('PersonalData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useMutation.mockReturnValue([vi.fn(), { loading: false }]);
  });

  it('renders the read-only view with user details', () => {
    mocks.useMutation.mockReturnValue([vi.fn(), { loading: false }]);

    const user: ProfileUser = {
      id: 'user-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      userName: 'ada',
      email: 'ada@example.com',
      role: 'USER',
      locale: 'en_GB',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-02-01T00:00:00.000Z',
    };

    render(<PersonalData user={user} loading={false} refetch={vi.fn()} />);

    expect(screen.getByTestId('personal-data-view')).toBeInTheDocument();
    expect(screen.getByTestId('info-field-user.firstName')).toHaveTextContent(
      'Ada',
    );
    expect(screen.getByTestId('info-field-user.lastName')).toHaveTextContent(
      'Lovelace',
    );
  });

  it('enters edit mode and submits updated values', async () => {
    const updateUser = vi
      .fn()
      .mockResolvedValue({ data: { updateUser: { success: true } } });
    const refetch = vi.fn();
    mocks.useMutation.mockReturnValue([updateUser, { loading: false }]);

    const user: ProfileUser = {
      id: 'user-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      userName: 'ada',
      email: 'ada@example.com',
      role: 'USER',
      locale: 'en_GB',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-02-01T00:00:00.000Z',
    };

    render(<PersonalData user={user} loading={false} refetch={refetch} />);

    fireEvent.click(screen.getByTestId('personal-data-edit-button'));
    fireEvent.change(screen.getByLabelText(/user\.firstName/), {
      target: { value: 'Grace' },
    });
    fireEvent.change(screen.getByLabelText(/user\.lastName/), {
      target: { value: 'Hopper' },
    });
    fireEvent.submit(screen.getByTestId('personal-data-form'));

    await waitFor(() => {
      expect(updateUser).toHaveBeenCalled();
    });
    expect(refetch).toHaveBeenCalled();
  });

  it('shows an error notification when mutation fails', async () => {
    const updateUser = vi.fn().mockRejectedValue(new Error('boom'));
    mocks.useMutation.mockReturnValue([updateUser, { loading: false }]);

    const user: ProfileUser = {
      id: 'user-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      userName: 'ada',
      email: 'ada@example.com',
      role: 'USER',
      locale: 'en_GB',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-02-01T00:00:00.000Z',
    };

    render(<PersonalData user={user} loading={false} refetch={vi.fn()} />);

    fireEvent.click(screen.getByTestId('personal-data-edit-button'));
    fireEvent.submit(screen.getByTestId('personal-data-form'));

    await waitFor(() => {
      expect(mocks.notificationsShow).toHaveBeenCalled();
    });
  });

  it('renders loading fields and hides edit while the user is loading', () => {
    render(<PersonalData user={undefined} loading refetch={vi.fn()} />);

    expect(screen.getByTestId('personal-data-form')).toBeInTheDocument();
    expect(
      screen.queryByTestId('personal-data-edit-button'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('general.edit')).not.toBeInTheDocument();
  });

  it('cancels editing and returns to the read-only view', () => {
    const user: ProfileUser = {
      id: 'user-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      userName: 'ada',
      email: 'ada@example.com',
      role: 'USER',
      locale: 'en_GB',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-02-01T00:00:00.000Z',
    };

    render(<PersonalData user={user} loading={false} refetch={vi.fn()} />);
    fireEvent.click(screen.getByTestId('personal-data-edit-button'));
    fireEvent.click(screen.getByRole('button', { name: 'general.cancel' }));

    expect(screen.getByTestId('personal-data-edit-button')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'general.cancel' }),
    ).not.toBeInTheDocument();
  });

  it('shows the fallback notification for an unsuccessful update response', async () => {
    const updateUser = vi.fn().mockResolvedValue({
      data: { updateUser: { success: false, message: 'not used' } },
    });
    mocks.useMutation.mockReturnValue([updateUser, { loading: false }]);
    const user = {
      id: 'user-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      userName: 'ada',
      email: 'ada@example.com',
      role: 'USER',
      locale: 'en_GB',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-02-01T00:00:00.000Z',
    } satisfies ProfileUser;

    render(<PersonalData user={user} loading={false} refetch={vi.fn()} />);
    fireEvent.click(screen.getByTestId('personal-data-edit-button'));
    fireEvent.submit(screen.getByTestId('personal-data-form'));

    await waitFor(() => expect(mocks.notificationsShow).toHaveBeenCalled());
    expect(
      screen.getByRole('button', { name: 'general.cancel' }),
    ).toBeInTheDocument();
  });
});
