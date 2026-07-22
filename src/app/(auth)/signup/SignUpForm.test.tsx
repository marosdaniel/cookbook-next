import '@testing-library/jest-dom';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import { AUTH_ROUTES } from '../../../types/routes';
import SignUpForm from './SignUpForm';

// Mock zodResolver
vi.mock('@/lib/validation/zodResolver', () => ({
  zodResolver: vi.fn(() => (values: Record<string, unknown>) => {
    const errors: Record<string, string> = {};
    if (!values.firstName) errors.firstName = 'Required';
    if (!values.lastName) errors.lastName = 'Required';
    if (!values.userName) errors.userName = 'Required';
    if (!values.email) errors.email = 'Required';
    if (!values.password) errors.password = 'Required'; // NOSONAR
    if (!values.confirmPassword) errors.confirmPassword = 'Required'; // NOSONAR
    if (values.password !== values.confirmPassword)
      errors.confirmPassword = 'Mismatch'; // NOSONAR
    if (!values.privacyAccepted) errors.privacyAccepted = 'Required';
    return errors;
  }),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'auth.createAccount': 'Create Account',
      'auth.alreadyHaveAnAccount': 'Already have an account?',
      'auth.login': 'Login',
      'user.firstName': 'First Name',
      'user.lastName': 'Last Name',
      'user.userName': 'Username',
      'user.email': 'Email',
      'user.password': 'Password', // NOSONAR
      'user.confirmPassword': 'Confirm Password', // NOSONAR
      'auth.emailPlaceholder': 'your@email.com',
      'auth.createAnAccountButton': 'Create an account',
      'response.success': 'Success',
      'response.error': 'Error',
      'auth.accountCreatedSuccess': 'Account created successfully',
      'auth.loginSuccess': 'Successfully logged in!',
      'response.unknownError': 'Unknown error',
    };
    return translations[key] || key;
  },
}));

// Mock @mantine/notifications
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock Apollo Client
const mockCreateUser = vi.fn();
vi.mock('@apollo/client/react', () => ({
  useMutation: () => [mockCreateUser, { loading: false }],
}));

// Mock PrivacyPolicyLink
vi.mock('../../../components/PrivacyPolicyLink', () => ({
  default: () => <span>I accept the privacy policy</span>,
}));

describe('SignUpForm', () => {
  const mockPush = vi.fn();
  const mockRouter = {
    push: mockPush,
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    replace: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
  });

  describe('Rendering', () => {
    it('renders the signup form with all elements', () => {
      render(<SignUpForm />);

      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByTestId('sign-up-page')).toBeInTheDocument();
      expect(screen.getByTestId('sign-up-title')).toBeInTheDocument();
      expect(screen.getByTestId('sign-up-form')).toBeInTheDocument();
      expect(
        screen.getByTestId('sign-up-first-name-input'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('sign-up-last-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('sign-up-user-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('sign-up-email-input')).toBeInTheDocument();
      expect(screen.getByTestId('sign-up-password-input')).toBeInTheDocument();
      expect(
        screen.getByTestId('sign-up-confirm-password-input'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('sign-up-submit-button')).toBeInTheDocument();
    });

    it('renders login link', () => {
      render(<SignUpForm />);

      const loginLink = screen
        .getByTestId('sign-up-login-link')
        .querySelector('a');

      expect(loginLink).toHaveAttribute('href', AUTH_ROUTES.LOGIN);
    });

    it('renders privacy policy checkbox', () => {
      render(<SignUpForm />);

      expect(
        screen.getByTestId('sign-up-privacy-checkbox'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('I accept the privacy policy'),
      ).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('submit button is disabled when form is empty', () => {
      render(<SignUpForm />);

      const submitButton = screen.getByTestId('sign-up-submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when all fields are valid', async () => {
      render(<SignUpForm />);

      const firstNameInput = screen.getByTestId('sign-up-first-name-input');
      const lastNameInput = screen.getByTestId('sign-up-last-name-input');
      const userNameInput = screen.getByTestId('sign-up-user-name-input');
      const emailInput = screen.getByTestId('sign-up-email-input');
      const passwordInput = screen.getByTestId('sign-up-password-input');
      const confirmPasswordInput = screen.getByTestId(
        'sign-up-confirm-password-input',
      );
      const privacyCheckbox = screen.getByTestId('sign-up-privacy-checkbox');
      const submitButton = screen.getByTestId('sign-up-submit-button');

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(userNameInput, { target: { value: 'johndoe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Example123!' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'Example123!' },
      });
      fireEvent.click(privacyCheckbox);

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Form Submission', () => {
    const fillForm = () => {
      const firstNameInput = screen.getByTestId('sign-up-first-name-input');
      const lastNameInput = screen.getByTestId('sign-up-last-name-input');
      const userNameInput = screen.getByTestId('sign-up-user-name-input');
      const emailInput = screen.getByTestId('sign-up-email-input');
      const passwordInput = screen.getByTestId('sign-up-password-input');
      const confirmPasswordInput = screen.getByTestId(
        'sign-up-confirm-password-input',
      );
      const privacyCheckbox = screen.getByTestId('sign-up-privacy-checkbox');

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(userNameInput, { target: { value: 'johndoe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Example123!' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'Example123!' },
      });
      fireEvent.click(privacyCheckbox);
    };

    it('calls createUser mutation with correct data on submit', async () => {
      mockCreateUser.mockResolvedValue({
        data: { createUser: { id: '1', email: 'john@example.com' } },
      });

      render(<SignUpForm />);

      fillForm();

      const submitButton = screen.getByTestId('sign-up-submit-button');

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateUser).toHaveBeenCalledWith({
          variables: {
            userRegisterInput: {
              firstName: 'John',
              lastName: 'Doe',
              userName: 'johndoe',
              email: 'john@example.com',
              password: 'Example123!',
              confirmPassword: 'Example123!',
            },
          },
        });
      });
    });

    it('shows success notification and redirects on successful signup', async () => {
      mockCreateUser.mockResolvedValue({
        data: {
          createUser: {
            success: true,
            user: { id: '1', email: 'john@example.com' },
          },
        },
      });

      // @ts-expect-error - Mocking signIn return value
      vi.mocked(signIn).mockResolvedValue({ ok: true });

      render(<SignUpForm />);

      fillForm();

      const submitButton = screen.getByTestId('sign-up-submit-button');

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      fireEvent.click(submitButton);

      // First notification: account created
      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith({
          title: 'Success',
          message: 'Account created successfully',
          color: 'green',
        });
      });

      // Auto-login should be called
      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'john@example.com',
          password: 'Example123!',
          redirect: false,
        });
      });

      // Second notification: login success
      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith({
          title: 'Success',
          message: 'Successfully logged in!',
          color: 'green',
        });
      });

      // Redirect to home page
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('shows error notification on failed signup', async () => {
      mockCreateUser.mockRejectedValue(new Error('Email already exists'));

      render(<SignUpForm />);

      fillForm();

      const submitButton = screen.getByTestId('sign-up-submit-button');

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith({
          title: 'Error',
          message: 'Email already exists',
          color: 'red',
        });
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('redirects to login when signup succeeds but auto-login fails', async () => {
      mockCreateUser.mockResolvedValue({
        data: {
          createUser: {
            success: true,
            user: { id: '1', email: 'john@example.com' },
          },
        },
      });

      vi.mocked(signIn).mockResolvedValue({
        ok: false,
        error: 'CredentialsSignin',
        status: 401,
        url: null,
      } as never);

      render(<SignUpForm />);

      fillForm();

      const submitButton = screen.getByTestId('sign-up-submit-button');

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(AUTH_ROUTES.LOGIN);
      });
    });

    it('shows unknown error notification on non-Error exception', async () => {
      mockCreateUser.mockRejectedValue('Something went wrong');

      render(<SignUpForm />);

      fillForm();

      const submitButton = screen.getByTestId('sign-up-submit-button');

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith({
          title: 'Error',
          message: 'Unknown error',
          color: 'red',
        });
      });
    });
  });

  describe('Privacy Policy', () => {
    it('requires privacy policy acceptance', async () => {
      render(<SignUpForm />);

      const firstNameInput = screen.getByTestId('sign-up-first-name-input');
      const lastNameInput = screen.getByTestId('sign-up-last-name-input');
      const userNameInput = screen.getByTestId('sign-up-user-name-input');
      const emailInput = screen.getByTestId('sign-up-email-input');
      const passwordInput = screen.getByTestId('sign-up-password-input');
      const confirmPasswordInput = screen.getByTestId(
        'sign-up-confirm-password-input',
      );
      const submitButton = screen.getByTestId('sign-up-submit-button');

      // Fill all fields except privacy checkbox
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(userNameInput, { target: { value: 'johndoe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Example123!' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'Example123!' },
      });

      // Submit button should still be disabled
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('toggles privacy policy checkbox', () => {
      render(<SignUpForm />);

      const checkbox = screen.getByTestId('sign-up-privacy-checkbox');
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });
});
