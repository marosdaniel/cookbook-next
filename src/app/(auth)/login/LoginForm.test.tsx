import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginForm } from './LoginForm';

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
      'user.password': 'Password',
      'auth.rememberMe': 'Remember me',
      'auth.forgotPassword': 'Forgot password?',
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

// Helper function to get form inputs
const getFormInputs = (container: HTMLElement) => ({
  emailInput: container.querySelector('#email') as HTMLInputElement,
  passwordInput: container.querySelector('#password') as HTMLInputElement,
});

// Helper function to fill login form
const fillLoginForm = async (
  emailInput: HTMLInputElement,
  passwordInput: HTMLInputElement,
  email = 'test@example.com',
  password = 'password123',
) => {
  fireEvent.change(emailInput, { target: { value: email } });
  fireEvent.change(passwordInput, { target: { value: password } });

  const submitButton = screen.getByRole('button', { name: /sign in/i });
  await waitFor(() => {
    expect(submitButton).not.toBeDisabled();
  });

  return submitButton;
};

// Mock helpers to reduce nesting
const mockSignInSuccess = () => {
  (signIn as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
};

const mockSignInError = (error: Error) => {
  (signIn as ReturnType<typeof vi.fn>).mockRejectedValue(error);
};

const createDelayedResolve = () => {
  return { ok: true };
};

const mockSignInDelayed = (delayMs: number) => {
  (signIn as ReturnType<typeof vi.fn>).mockImplementation(
    () =>
      new Promise((resolve) => {
        setTimeout(() => resolve(createDelayedResolve()), delayMs);
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
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
  });

  describe('Rendering', () => {
    it('renders the login form with all elements', () => {
      const { container } = render(
        <MantineProvider>
          <LoginForm />
        </MantineProvider>,
      );

      expect(screen.getByText('Welcome back!')).toBeInTheDocument();
      expect(container.querySelector('#email')).toBeInTheDocument();
      expect(container.querySelector('#password')).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', { name: /remember me/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /sign in/i }),
      ).toBeInTheDocument();
    });

    it('renders signup link', () => {
      render(
        <MantineProvider>
          <LoginForm />
        </MantineProvider>,
      );

      const signupLink = screen.getByRole('link', { name: /create account/i });
      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveAttribute('href', '/signup');
    });

    it('renders forgot password link', () => {
      render(
        <MantineProvider>
          <LoginForm />
        </MantineProvider>,
      );

      const forgotPasswordLink = screen.getByRole('link', {
        name: /forgot password/i,
      });
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink).toHaveAttribute('href', '/reset-password');
    });

    it('has correct container id', () => {
      const { container } = render(
        <MantineProvider>
          <LoginForm />
        </MantineProvider>,
      );

      const loginPage = container.querySelector('#login-page');
      expect(loginPage).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('submit button is disabled when form is empty', () => {
      render(
        <MantineProvider>
          <LoginForm />
        </MantineProvider>,
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when form is valid', async () => {
      const { container } = render(
        <MantineProvider>
          <LoginForm />
        </MantineProvider>,
      );

      const emailInput = container.querySelector('#email') as HTMLInputElement;
      const passwordInput = container.querySelector(
        '#password',
      ) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Form Submission', () => {
    it('calls signIn with correct credentials on submit', async () => {
      mockSignInSuccess();

      const { container } = render(
        <MantineProvider>
          <LoginForm />
        </MantineProvider>,
      );

      const { emailInput, passwordInput } = getFormInputs(container);
      const submitButton = await fillLoginForm(emailInput, passwordInput);

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password123',
          redirect: false,
          rememberMe: false,
        });
      });
    });

    it('includes rememberMe when checkbox is checked', async () => {
      mockSignInSuccess();

      const { container } = render(
        <MantineProvider>
          <LoginForm />
        </MantineProvider>,
      );

      const { emailInput, passwordInput } = getFormInputs(container);
      const rememberMeCheckbox = screen.getByRole('checkbox', {
        name: /remember me/i,
      });
      const submitButton = await fillLoginForm(emailInput, passwordInput);

      fireEvent.click(rememberMeCheckbox);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password123',
          redirect: false,
          rememberMe: true,
        });
      });
    });

    it('shows success notification and redirects on successful login', async () => {
      mockSignInSuccess();

      const { container } = render(
        <MantineProvider>
          <LoginForm />
        </MantineProvider>,
      );

      const { emailInput, passwordInput } = getFormInputs(container);
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

      const { container } = render(
        <MantineProvider>
          <LoginForm />
        </MantineProvider>,
      );

      const { emailInput, passwordInput } = getFormInputs(container);
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
      render(
        <MantineProvider>
          <LoginForm />
        </MantineProvider>,
      );

      const checkbox = screen.getByRole('checkbox', { name: /remember me/i });
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

      const { container } = render(
        <MantineProvider>
          <LoginForm />
        </MantineProvider>,
      );

      const { emailInput, passwordInput } = getFormInputs(container);
      const submitButton = await fillLoginForm(emailInput, passwordInput);

      fireEvent.click(submitButton);

      // Button should be disabled during submission
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });
});
