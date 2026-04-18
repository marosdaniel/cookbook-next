import '@testing-library/jest-dom';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import type { SignInResponse } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import { AUTH_ROUTES } from '../../../types/routes';
import { LoginForm } from './LoginForm';

// Mock zodResolver
vi.mock('@/lib/validation/zodResolver', () => ({
  zodResolver: vi.fn(() => (values: Record<string, unknown>) => {
    const errors: Record<string, string> = {};
    if (!values.email) errors.email = 'Required';
    if (!values.password) errors.password = 'Required'; // NOSONAR
    return errors;
  }),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'auth.welcomeBack': 'Welcome back!',
      'auth.dontYouHaveAnAccount': "Don't have an account?",
      'auth.createAccountButton': 'Create account',
      'user.email': 'Email',
      'user.password': 'Password', // NOSONAR
      'auth.rememberMe': 'Remember me',
      'auth.forgotPassword': 'Forgot password?', // NOSONAR
      'auth.signIn': 'Sign in',
      'response.success': 'Success',
      'response.error': 'Error',
      'auth.loginSuccess': 'Login successful',
      'auth.invalidCredentials': 'Invalid credentials',
      'auth.loginError': 'Login error',
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
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Typed mocked helpers
const mockedSignIn = vi.mocked(signIn);
const mockedUseRouter = vi.mocked(useRouter);

// Helper function to get form inputs
const getFormInputs = (container: HTMLElement) => ({
  emailInput: container.querySelector<HTMLInputElement>('#email'),
  passwordInput: container.querySelector<HTMLInputElement>('#password'),
});

// Helper function to fill login form
const fillLoginForm = async (
  emailInput: HTMLInputElement,
  passwordInput: HTMLInputElement,
  email = 'test@example.com',
  password = 'Password1',
) => {
  fireEvent.change(emailInput, { target: { value: email } });
  fireEvent.change(passwordInput, { target: { value: password } });

  const submitButton = screen.getByTestId('login-button');
  await waitFor(() => {
    expect(submitButton).not.toBeDisabled();
  });

  return submitButton;
};

const SIGN_IN_SUCCESS: SignInResponse = {
  ok: true,
  error: undefined,
  code: undefined,
  status: 200,
  url: '/',
};

// Mock helpers to reduce nesting
const mockSignInSuccess = () => {
  mockedSignIn.mockResolvedValue(SIGN_IN_SUCCESS);
};

const mockSignInError = (error: Error) => {
  mockedSignIn.mockRejectedValue(error);
};

const mockSignInDelayed = (delayMs: number) => {
  mockedSignIn.mockImplementation(
    () =>
      new Promise((resolve) => {
        setTimeout(() => resolve(SIGN_IN_SUCCESS), delayMs);
      }),
  );
};

describe('LoginForm', () => {
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();
  const mockRouter = {
    push: mockPush,
    refresh: mockRefresh,
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    replace: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseRouter.mockReturnValue(mockRouter);
  });

  describe('Rendering', () => {
    it('renders the login form with all elements', () => {
      const { container } = render(<LoginForm />);

      expect(screen.getByText('Welcome back!')).toBeInTheDocument();
      expect(container.querySelector('#email')).toBeInTheDocument();
      expect(container.querySelector('#password')).toBeInTheDocument();
      expect(screen.getByTestId('remember-me')).toBeInTheDocument();
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
    });

    it('renders signup link', () => {
      const { container } = render(<LoginForm />);

      const signupLink = container.querySelector(
        `a[href="${AUTH_ROUTES.SIGNUP}"]`,
      );
      expect(signupLink).toBeInTheDocument();
    });

    it('renders forgot password link', () => {
      const { container } = render(<LoginForm />);

      const forgotPasswordLink = container.querySelector(
        `a[href="${AUTH_ROUTES.RESET_PASSWORD}"]`,
      );
      expect(forgotPasswordLink).toBeInTheDocument();
    });

    it('has correct container id', () => {
      const { container } = render(<LoginForm />);

      const loginPage = container.querySelector('#login-page');
      expect(loginPage).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('submit button is enabled when form is empty', () => {
      render(<LoginForm />);

      const submitButton = screen.getByTestId('login-button');
      expect(submitButton).toBeEnabled();
    });

    it('enables submit button when form is valid', async () => {
      const { container } = render(<LoginForm />);

      const emailInput = container.querySelector('#email');
      const passwordInput = container.querySelector('#password');
      const submitButton = screen.getByTestId('login-button');

      if (!emailInput || !passwordInput) {
        throw new Error('Form inputs not found');
      }
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password1' } });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Form Submission', () => {
    it('calls signIn with correct credentials on submit', async () => {
      mockSignInSuccess();

      const { container } = render(<LoginForm />);

      const { emailInput, passwordInput } = getFormInputs(container);
      if (!emailInput || !passwordInput) {
        throw new Error('Form inputs not found');
      }
      const submitButton = await fillLoginForm(emailInput, passwordInput);

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'Password1', // NOSONAR
          redirect: false,
          rememberMe: false,
        });
      });
    });

    it('includes rememberMe when checkbox is checked', async () => {
      mockSignInSuccess();

      const { container } = render(<LoginForm />);

      const { emailInput, passwordInput } = getFormInputs(container);
      if (!emailInput || !passwordInput) {
        throw new Error('Form inputs not found');
      }
      const rememberMeCheckbox = screen.getByTestId('remember-me');
      const submitButton = await fillLoginForm(emailInput, passwordInput);

      fireEvent.click(rememberMeCheckbox);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'Password1', // NOSONAR
          redirect: false,
          rememberMe: true,
        });
      });
    });

    it('shows success notification and redirects on successful login', async () => {
      mockSignInSuccess();

      const { container } = render(<LoginForm />);

      const { emailInput, passwordInput } = getFormInputs(container);
      if (!emailInput || !passwordInput) {
        throw new Error('Form inputs not found');
      }
      const submitButton = await fillLoginForm(emailInput, passwordInput);

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith({
          title: 'Success',
          message: 'Login successful',
          color: 'green',
        });
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('shows error notification on exception', async () => {
      mockSignInError(new Error('Network error'));

      const { container } = render(<LoginForm />);

      const { emailInput, passwordInput } = getFormInputs(container);
      if (!emailInput || !passwordInput) {
        throw new Error('Form inputs not found');
      }
      const submitButton = await fillLoginForm(emailInput, passwordInput);

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith({
          title: 'Error',
          message: 'Login error',
          color: 'red',
        });
      });
    });
  });

  describe('Remember Me Functionality', () => {
    it('toggles remember me checkbox', () => {
      render(<LoginForm />);

      const checkbox = screen.getByTestId('remember-me');
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Loading State', () => {
    it('disables submit button and shows loading state during submission', async () => {
      mockSignInDelayed(100);

      const { container } = render(<LoginForm />);

      const { emailInput, passwordInput } = getFormInputs(container);
      if (!emailInput || !passwordInput) {
        throw new Error('Form inputs not found');
      }
      const submitButton = await fillLoginForm(emailInput, passwordInput);

      fireEvent.click(submitButton);

      // Button should be disabled during submission
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });
});
