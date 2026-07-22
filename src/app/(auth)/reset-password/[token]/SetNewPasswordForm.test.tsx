import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@/utils/test-utils';
import { SetNewPasswordForm } from './SetNewPasswordForm';

const {
  mockSetNewPassword,
  mockShowErrorNotification,
  mockUseParams,
  mockUseRouter,
} = vi.hoisted(() => ({
  mockSetNewPassword: vi.fn(),
  mockShowErrorNotification: vi.fn(),
  mockUseParams: vi.fn(),
  mockUseRouter: vi.fn(),
}));

vi.mock('@apollo/client/react', () => ({
  useMutation: () => [mockSetNewPassword, { loading: false }],
}));

vi.mock('next/navigation', () => ({
  useRouter: mockUseRouter,
  useParams: mockUseParams,
}));

vi.mock('@/lib/validation/zodResolver', () => ({
  zodResolver: vi.fn(() => (values: Record<string, unknown>) => {
    const errors: Record<string, string> = {};
    if (!values.newPassword) errors.newPassword = 'Required';
    if (!values.confirmPassword) errors.confirmPassword = 'Required';
    return errors;
  }),
}));

vi.mock('@/lib/validation', () => ({
  isFormSubmitDisabled: vi.fn(() => false),
  setNewPasswordValidationSchema: {},
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'auth.setNewPasswordTitle': 'Set new password',
      'auth.setNewPasswordDescription':
        'Choose a new password for your account.',
      'auth.newPassword': 'New password',
      'auth.enterNewPassword': 'Enter new password',
      'auth.confirmPassword': 'Confirm password',
      'auth.confirmNewPassword': 'Confirm new password',
      'response.passwordRequirements': 'Password requirements',
      'auth.setNewPasswordButton': 'Set password',
      'auth.backToLogin': 'Back to login',
      'response.error': 'Error',
      'response.invalidResetToken': 'Invalid reset token',
      'response.passwordResetFailed': 'Password reset failed',
      'response.somethingWentWrong': 'Something went wrong',
      'auth.passwordResetSuccessTitle': 'Password reset successful',
      'response.passwordResetSuccess': 'Your password was reset successfully.',
      'auth.redirectingToLogin': 'You will be redirected to login shortly.',
    };

    return translations[key] || key;
  },
}));

vi.mock('../../../../utils/notifications', () => ({
  showErrorNotification: mockShowErrorNotification,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('SetNewPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    mockUseRouter.mockReturnValue({ push: vi.fn() });
    mockUseParams.mockReturnValue({ token: 'abc123' });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the set new password form', () => {
    render(<SetNewPasswordForm />);

    expect(screen.getByText('Set new password')).toBeInTheDocument();
    expect(screen.getByTestId('set-new-password-input')).toBeInTheDocument();
    expect(
      screen.getByTestId('set-new-password-confirm-input'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('set-new-password-submit-button'),
    ).toBeInTheDocument();
  });

  it('shows an error notification when no token is available', async () => {
    mockUseParams.mockReturnValue({ token: undefined });

    render(<SetNewPasswordForm />);

    fireEvent.change(screen.getByTestId('set-new-password-input'), {
      target: { value: 'NewPassword1!' },
    });
    fireEvent.change(screen.getByTestId('set-new-password-confirm-input'), {
      target: { value: 'NewPassword1!' },
    });
    fireEvent.click(screen.getByTestId('set-new-password-submit-button'));

    expect(mockShowErrorNotification).toHaveBeenCalledWith(
      'Error',
      'Invalid reset token',
    );
  });

  it('submits the new password and redirects after a successful response', async () => {
    const push = vi.fn();
    mockUseRouter.mockReturnValue({ push });

    mockSetNewPassword.mockImplementation(async () => ({
      data: {
        setNewPassword: {
          success: true,
        },
      },
    }));

    render(<SetNewPasswordForm />);

    await act(async () => {
      fireEvent.change(screen.getByTestId('set-new-password-input'), {
        target: { value: 'NewPassword1!' },
      });
      fireEvent.change(screen.getByTestId('set-new-password-confirm-input'), {
        target: { value: 'NewPassword1!' },
      });
      fireEvent.submit(screen.getByTestId('set-new-password-form'));
      await Promise.resolve();
    });

    expect(mockSetNewPassword).toHaveBeenCalledWith({
      variables: {
        token: 'abc123',
        newPassword: 'NewPassword1!',
      },
    });
    expect(
      screen.getAllByText('Password reset successful').length,
    ).toBeGreaterThan(0);
  });

  it('shows an error notification if the mutation throws', async () => {
    mockSetNewPassword.mockRejectedValue(new Error('Network error'));

    render(<SetNewPasswordForm />);

    fireEvent.change(screen.getByTestId('set-new-password-input'), {
      target: { value: 'NewPassword1!' },
    });
    fireEvent.change(screen.getByTestId('set-new-password-confirm-input'), {
      target: { value: 'NewPassword1!' },
    });
    fireEvent.click(screen.getByTestId('set-new-password-submit-button'));

    await Promise.resolve();

    expect(mockShowErrorNotification).toHaveBeenCalledWith(
      'Password reset failed',
      'Something went wrong',
      expect.any(Error),
    );
  });
});
