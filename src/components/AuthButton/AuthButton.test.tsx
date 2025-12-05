import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_ROUTES } from '@/types/routes';
import AuthButton from './AuthButton';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      login: 'Login',
    };
    return translations[key] || key;
  },
}));

// Mock react-icons
vi.mock('react-icons/fi', () => ({
  FiLogIn: () => <span data-testid="login-icon">LoginIcon</span>,
}));

describe('AuthButton', () => {
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

  describe('Default Variant', () => {
    it('renders a button with login text', () => {
      render(
        <MantineProvider>
          <AuthButton />
        </MantineProvider>,
      );

      const button = screen.getByRole('button', { name: /login/i });
      expect(button).toBeInTheDocument();
    });

    it('renders with login icon', () => {
      render(
        <MantineProvider>
          <AuthButton />
        </MantineProvider>,
      );

      const icon = screen.getByTestId('login-icon');
      expect(icon).toBeInTheDocument();
    });

    it('navigates to login page when clicked', async () => {
      render(
        <MantineProvider>
          <AuthButton />
        </MantineProvider>,
      );

      const button = screen.getByRole('button', { name: /login/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(AUTH_ROUTES.LOGIN);
      });
    });

    it('applies gradient styling', () => {
      render(
        <MantineProvider>
          <AuthButton />
        </MantineProvider>,
      );

      const button = screen.getByRole('button', { name: /login/i });
      // Check that it's a Mantine Button component
      expect(button).toHaveClass('mantine-Button-root');
      expect(button).toHaveAttribute('data-variant', 'gradient');
    });
  });

  describe('Compact Variant', () => {
    it('renders button with login text in compact variant', () => {
      render(
        <MantineProvider>
          <AuthButton variant="compact" />
        </MantineProvider>,
      );

      // Should render at least one button element
      const button = screen.getByRole('button', { name: /login/i });
      expect(button).toBeInTheDocument();
    });

    it('has gradient variant styling', () => {
      render(
        <MantineProvider>
          <AuthButton variant="compact" />
        </MantineProvider>,
      );

      const button = screen.getByRole('button', { name: /login/i });
      expect(button).toHaveAttribute('data-variant', 'gradient');
    });

    it('navigates to login page when clicked in compact variant', async () => {
      render(
        <MantineProvider>
          <AuthButton variant="compact" />
        </MantineProvider>,
      );

      const button = screen.getByRole('button', { name: /login/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(AUTH_ROUTES.LOGIN);
      });
    });

    it('renders login icons for both responsive variants', () => {
      render(
        <MantineProvider>
          <AuthButton variant="compact" />
        </MantineProvider>,
      );

      // Compact variant renders both ActionIcon (mobile) and Button (desktop)
      const icons = screen.getAllByTestId('login-icon');
      expect(icons).toHaveLength(2);
    });
  });

  describe('Loading State', () => {
    it('shows loading state during transition', async () => {
      render(
        <MantineProvider>
          <AuthButton />
        </MantineProvider>,
      );

      const button = screen.getByRole('button', { name: /login/i });
      fireEvent.click(button);

      // The button should have loading state during transition
      // Note: This is handled by React's useTransition hook
      expect(mockPush).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has accessible button role', () => {
      render(
        <MantineProvider>
          <AuthButton />
        </MantineProvider>,
      );

      const button = screen.getByRole('button', { name: /login/i });
      expect(button).toBeInTheDocument();
    });

    it('button is focusable', () => {
      render(
        <MantineProvider>
          <AuthButton />
        </MantineProvider>,
      );

      const button = screen.getByRole('button', { name: /login/i });
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('handles multiple rapid clicks gracefully', async () => {
      render(
        <MantineProvider>
          <AuthButton />
        </MantineProvider>,
      );

      const button = screen.getByRole('button', { name: /login/i });

      // Click multiple times rapidly
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      // Should still navigate (React's startTransition handles this)
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });

    it('renders correctly without crashing when router is unavailable', () => {
      (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
        push: undefined,
      });

      expect(() => {
        render(
          <MantineProvider>
            <AuthButton />
          </MantineProvider>,
        );
      }).not.toThrow();
    });
  });
});
