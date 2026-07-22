import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import { ResetPasswordForm } from './ResetPasswordForm';

const {
  mockResetPassword,
  mockShowSuccessNotification,
  mockShowErrorNotification,
} = vi.hoisted(() => ({
  mockResetPassword: vi.fn(),
  mockShowSuccessNotification: vi.fn(),
  mockShowErrorNotification: vi.fn(),
}));

vi.mock('@apollo/client/react', () => ({
  useMutation: () => [mockResetPassword, { loading: false }],
}));

vi.mock('@/lib/validation/zodResolver', () => ({
  zodResolver: vi.fn(() => (values: Record<string, unknown>) => {
    const errors: Record<string, string> = {};
    if (!values.email) errors.email = 'Required';
    return errors;
  }),
}));

vi.mock('@/lib/validation', () => ({
  isFormSubmitDisabled: vi.fn(() => false),
  resetPasswordValidationSchema: {},
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'auth.forgotPasswordTitle': 'Forgot password?',
      'auth.forgotPasswordDescription':
        'Enter your email to receive a reset link.',
      'user.email': 'Email',
      'auth.emailPlaceholder': 'your@email.com',
      'auth.sendResetLink': 'Send reset link',
      'auth.backToLogin': 'Back to login',
      'response.success': 'Success',
      'response.resetPasswordFailed': 'Failed to reset password',
      'response.somethingWentWrong': 'Something went wrong',
      'response.emailSent': 'Email sent',
      'response.emailWithResetLinkSent':
        'A reset link has been sent to your email.',
      'response.checkSpamFolder': 'Please check your spam folder.',
      'auth.sendAnotherEmail': 'Send another email',
    };

    return translations[key] || key;
  },
}));

vi.mock('../../../utils/notifications', () => ({
  showSuccessNotification: mockShowSuccessNotification,
  showErrorNotification: mockShowErrorNotification,
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the reset password form with the expected fields and link', () => {
    render(<ResetPasswordForm />);

    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    expect(
      screen.getByText('Enter your email to receive a reset link.'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('reset-password-email-input'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('reset-password-submit-button'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to login' })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('shows success state and notification after a successful reset password request', async () => {
    mockResetPassword.mockResolvedValue({
      data: {
        resetPassword: {
          success: true,
          message: 'Reset link sent',
        },
      },
    });

    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByTestId('reset-password-email-input'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByTestId('reset-password-submit-button'));

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith({
        variables: { email: 'user@example.com' },
      });
    });

    await waitFor(() => {
      expect(mockShowSuccessNotification).toHaveBeenCalledWith(
        'Success',
        'Reset link sent',
      );
    });

    expect(screen.getByText('Email sent')).toBeInTheDocument();
    expect(
      screen.getByTestId('reset-password-send-another-button'),
    ).toBeInTheDocument();
  });

  it('shows an error notification when the reset password mutation throws', async () => {
    mockResetPassword.mockRejectedValue(new Error('Network error'));

    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByTestId('reset-password-email-input'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByTestId('reset-password-submit-button'));

    await waitFor(() => {
      expect(mockShowErrorNotification).toHaveBeenCalledWith(
        'Failed to reset password',
        'Something went wrong',
        expect.any(Error),
      );
    });
  });

  it('returns to the form when the user clicks send another email', async () => {
    mockResetPassword.mockResolvedValue({
      data: {
        resetPassword: {
          success: true,
          message: 'Reset link sent',
        },
      },
    });

    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByTestId('reset-password-email-input'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByTestId('reset-password-submit-button'));

    await waitFor(() => {
      expect(
        screen.getByTestId('reset-password-send-another-button'),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('reset-password-send-another-button'));

    expect(
      screen.getByTestId('reset-password-email-input'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('reset-password-submit-button'),
    ).toBeInTheDocument();
  });
});
