import '@testing-library/jest-dom';
import type { ChangeEvent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import Password from './Password';

const mocks = vi.hoisted(() => ({
  useMutation: vi.fn(),
  notificationsShow: vi.fn(),
  formReset: vi.fn(),
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
    type PasswordFormValues = {
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    };

    const values: PasswordFormValues = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    };

    return {
      getInputProps: (field: keyof PasswordFormValues) => ({
        defaultValue: values[field],
        onChange: (event: ChangeEvent<HTMLInputElement>) => {
          values[field] = event.target.value;
        },
      }),
      onSubmit:
        (
          handler: (
            submittedValues: PasswordFormValues,
          ) => void | Promise<void>,
        ) =>
        (event?: { preventDefault?: () => void }) => {
          event?.preventDefault?.();

          return handler(values);
        },
      reset: mocks.formReset,
      key: vi.fn((field: string) => field),
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

describe('Password', () => {
  const fillPasswordFields = () => {
    fireEvent.change(screen.getByLabelText(/user\.currentPassword/), {
      target: { value: 'old-password' },
    });
    fireEvent.change(screen.getByLabelText(/user\.newPassword/), {
      target: { value: 'new-password' },
    });
    fireEvent.change(screen.getByLabelText(/user\.confirmPassword/), {
      target: { value: 'new-password' },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useMutation.mockReturnValue([vi.fn(), { loading: false }]);
  });

  it('renders the password summary in view mode', () => {
    render(<Password />);

    expect(screen.getByTestId('password-view')).toBeInTheDocument();
    expect(screen.getByText('user.securityTitle')).toBeInTheDocument();
    expect(screen.getByText('user.password')).toBeInTheDocument();
    expect(screen.getByText('••••••••••••')).toBeInTheDocument();
    expect(screen.getByTestId('password-edit-button')).toBeInTheDocument();
  });

  it('enters edit mode when the edit button is clicked', () => {
    render(<Password />);

    fireEvent.click(screen.getByTestId('password-edit-button'));

    expect(screen.getByTestId('password-edit')).toBeInTheDocument();
    expect(screen.getByLabelText(/user\.currentPassword/)).toBeInTheDocument();
    expect(screen.getByLabelText(/user\.newPassword/)).toBeInTheDocument();
    expect(screen.getByLabelText(/user\.confirmPassword/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'general.cancel' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'general.save' }),
    ).toBeInTheDocument();
  });

  it('cancels editing, resets the form and returns to view mode', () => {
    render(<Password />);

    fireEvent.click(screen.getByTestId('password-edit-button'));
    fireEvent.click(screen.getByRole('button', { name: 'general.cancel' }));

    expect(mocks.formReset).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('password-view')).toBeInTheDocument();
    expect(screen.queryByTestId('password-edit')).not.toBeInTheDocument();
  });

  it('submits successfully, shows success notification and resets the form', async () => {
    const changePassword = vi
      .fn()
      .mockResolvedValue({ data: { changePassword: { success: true } } });

    mocks.useMutation.mockReturnValue([changePassword, { loading: false }]);

    render(<Password />);

    fireEvent.click(screen.getByTestId('password-edit-button'));
    fillPasswordFields();

    fireEvent.click(screen.getByRole('button', { name: 'general.save' }));

    await waitFor(() => {
      expect(changePassword).toHaveBeenCalledWith({
        variables: {
          passwordEditInput: {
            currentPassword: 'old-password',
            newPassword: 'new-password',
            confirmNewPassword: 'new-password',
          },
        },
      });
    });

    await waitFor(() => {
      expect(mocks.notificationsShow).toHaveBeenCalledWith({
        title: 'response.success',
        message: 'notifications.passwordChangedMessage',
        color: 'teal',
      });
    });

    expect(mocks.formReset).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('password-view')).toBeInTheDocument();
  });

  it('shows the API error message when the mutation returns an unsuccessful response', async () => {
    const changePassword = vi.fn().mockResolvedValue({
      data: {
        changePassword: {
          success: false,
          message: 'Invalid current password',
        },
      },
    });

    mocks.useMutation.mockReturnValue([changePassword, { loading: false }]);

    render(<Password />);

    fireEvent.click(screen.getByTestId('password-edit-button'));
    fillPasswordFields();

    fireEvent.click(screen.getByRole('button', { name: 'general.save' }));

    await waitFor(() => {
      expect(mocks.notificationsShow).toHaveBeenCalledWith({
        title: 'response.error',
        message: 'Invalid current password',
        color: 'red',
      });
    });

    expect(mocks.formReset).not.toHaveBeenCalled();
    expect(screen.getByTestId('password-edit')).toBeInTheDocument();
  });

  it('shows the fallback error message when the mutation returns no error message', async () => {
    const changePassword = vi.fn().mockResolvedValue({
      data: {
        changePassword: {
          success: false,
        },
      },
    });

    mocks.useMutation.mockReturnValue([changePassword, { loading: false }]);

    render(<Password />);

    fireEvent.click(screen.getByTestId('password-edit-button'));
    fillPasswordFields();

    fireEvent.click(screen.getByRole('button', { name: 'general.save' }));

    await waitFor(() => {
      expect(mocks.notificationsShow).toHaveBeenCalledWith({
        title: 'response.error',
        message: 'response.unknownError',
        color: 'red',
      });
    });

    expect(mocks.formReset).not.toHaveBeenCalled();
    expect(screen.getByTestId('password-edit')).toBeInTheDocument();
  });

  it('shows a generic error notification when the mutation throws', async () => {
    const changePassword = vi.fn().mockRejectedValue(new Error('boom'));

    mocks.useMutation.mockReturnValue([changePassword, { loading: false }]);

    render(<Password />);

    fireEvent.click(screen.getByTestId('password-edit-button'));
    fillPasswordFields();

    fireEvent.click(screen.getByRole('button', { name: 'general.save' }));

    await waitFor(() => {
      expect(mocks.notificationsShow).toHaveBeenCalledWith({
        title: 'response.error',
        message: 'response.somethingWentWrong',
        color: 'red',
      });
    });

    expect(mocks.formReset).not.toHaveBeenCalled();
    expect(screen.getByTestId('password-edit')).toBeInTheDocument();
  });

  it('renders a disabled save button while the mutation is loading', () => {
    mocks.useMutation.mockReturnValue([vi.fn(), { loading: true }]);

    render(<Password />);

    fireEvent.click(screen.getByTestId('password-edit-button'));

    expect(screen.getByRole('button', { name: 'general.save' })).toBeDisabled();
  });
});
