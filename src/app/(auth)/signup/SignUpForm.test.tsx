import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SignUpForm from './SignUpForm';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
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
      'user.password': 'Password',
      'user.confirmPassword': 'Confirm Password',
      'auth.createAnAccountButton': 'Create an account',
      'response.success': 'Success',
      'response.error': 'Error',
      'auth.accountCreatedSuccess': 'Account created successfully',
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
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
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
      const { container } = render(
        <MantineProvider>
          <SignUpForm />
        </MantineProvider>,
      );

      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(container.querySelector('#first-name')).toBeInTheDocument();
      expect(container.querySelector('#last-name')).toBeInTheDocument();
      expect(container.querySelector('#user-name')).toBeInTheDocument();
      expect(container.querySelector('#email')).toBeInTheDocument();
      expect(container.querySelector('#password')).toBeInTheDocument();
      expect(container.querySelector('#confirm-password')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /create an account/i }),
      ).toBeInTheDocument();
    });

    it('renders login link', () => {
      render(
        <MantineProvider>
          <SignUpForm />
        </MantineProvider>,
      );

      const loginLink = screen.getByRole('link', { name: /login/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('renders privacy policy checkbox', () => {
      render(
        <MantineProvider>
          <SignUpForm />
        </MantineProvider>,
      );

      expect(
        screen.getByText('I accept the privacy policy'),
      ).toBeInTheDocument();
    });

    it('has correct container id', () => {
      const { container } = render(
        <MantineProvider>
          <SignUpForm />
        </MantineProvider>,
      );

      const signUpPage = container.querySelector('#sign-up-page');
      expect(signUpPage).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('submit button is disabled when form is empty', () => {
      render(
        <MantineProvider>
          <SignUpForm />
        </MantineProvider>,
      );

      const submitButton = screen.getByRole('button', {
        name: /create an account/i,
      });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when all fields are valid', async () => {
      render(
        <MantineProvider>
          <SignUpForm />
        </MantineProvider>,
      );

      const firstNameInput = screen.getByPlaceholderText('First Name');
      const lastNameInput = screen.getByPlaceholderText('Last Name');
      const userNameInput = screen.getByPlaceholderText('Username');
      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput =
        screen.getByPlaceholderText('Confirm Password');
      const privacyCheckbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button', {
        name: /create an account/i,
      });

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(userNameInput, { target: { value: 'johndoe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'Password123!' },
      });
      fireEvent.click(privacyCheckbox);

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Form Submission', () => {
    const fillForm = () => {
      const firstNameInput = screen.getByPlaceholderText('First Name');
      const lastNameInput = screen.getByPlaceholderText('Last Name');
      const userNameInput = screen.getByPlaceholderText('Username');
      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput =
        screen.getByPlaceholderText('Confirm Password');
      const privacyCheckbox = screen.getByRole('checkbox');

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(userNameInput, { target: { value: 'johndoe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'Password123!' },
      });
      fireEvent.click(privacyCheckbox);
    };

    it('calls createUser mutation with correct data on submit', async () => {
      mockCreateUser.mockResolvedValue({
        data: { createUser: { id: '1', email: 'john@example.com' } },
      });

      render(
        <MantineProvider>
          <SignUpForm />
        </MantineProvider>,
      );

      fillForm();

      const submitButton = screen.getByRole('button', {
        name: /create an account/i,
      });

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
              password: 'Password123!',
              confirmPassword: 'Password123!',
            },
          },
        });
      });
    });

    it('shows success notification and redirects on successful signup', async () => {
      mockCreateUser.mockResolvedValue({
        data: { createUser: { id: '1', email: 'john@example.com' } },
      });

      render(
        <MantineProvider>
          <SignUpForm />
        </MantineProvider>,
      );

      fillForm();

      const submitButton = screen.getByRole('button', {
        name: /create an account/i,
      });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith({
          title: 'Success',
          message: 'Account created successfully',
          color: 'green',
        });
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('shows error notification on failed signup', async () => {
      mockCreateUser.mockRejectedValue(new Error('Email already exists'));

      render(
        <MantineProvider>
          <SignUpForm />
        </MantineProvider>,
      );

      fillForm();

      const submitButton = screen.getByRole('button', {
        name: /create an account/i,
      });

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

    it('shows unknown error notification on non-Error exception', async () => {
      mockCreateUser.mockRejectedValue('Something went wrong');

      render(
        <MantineProvider>
          <SignUpForm />
        </MantineProvider>,
      );

      fillForm();

      const submitButton = screen.getByRole('button', {
        name: /create an account/i,
      });

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
      render(
        <MantineProvider>
          <SignUpForm />
        </MantineProvider>,
      );

      const firstNameInput = screen.getByPlaceholderText('First Name');
      const lastNameInput = screen.getByPlaceholderText('Last Name');
      const userNameInput = screen.getByPlaceholderText('Username');
      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput =
        screen.getByPlaceholderText('Confirm Password');
      const submitButton = screen.getByRole('button', {
        name: /create an account/i,
      });

      // Fill all fields except privacy checkbox
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(userNameInput, { target: { value: 'johndoe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'Password123!' },
      });

      // Submit button should still be disabled
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('toggles privacy policy checkbox', () => {
      render(
        <MantineProvider>
          <SignUpForm />
        </MantineProvider>,
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });
});
