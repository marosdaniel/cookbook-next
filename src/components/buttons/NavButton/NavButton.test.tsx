import '@testing-library/jest-dom';
import { render, screen } from '@/utils/test-utils';
import type { Route } from 'next';
import { describe, expect, it, vi } from 'vitest';
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from '../../../types/routes';
import NavButton from './NavButton';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe('NavButton', () => {

  describe('Basic rendering', () => {
    it('renders with label text', () => {
      render(<NavButton label="Test Button" href="/" />);
      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    it('renders with correct href attribute', () => {
      render(<NavButton label="Home" href={PUBLIC_ROUTES.HOME} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', PUBLIC_ROUTES.HOME);
    });

    it('renders as a link element', () => {
      render(
        <NavButton label="Navigate" href={PUBLIC_ROUTES.HOME} />,
      );
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    it('displays the correct label text', () => {
      render(<NavButton label="Click Me" href="/" />);
      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });
  });

  describe('Icon prop', () => {
    it('renders without icon when icon prop is not provided', () => {
      render(<NavButton label="No Icon" href="/" />);
      expect(screen.getByText('No Icon')).toBeInTheDocument();
    });

    it('renders with icon when icon prop is provided', () => {
      const testIcon = <svg data-testid="test-icon" />;
      render(
        <NavButton label="With Icon" href="/" icon={testIcon} />,
      );
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders icon and label together', () => {
      const testIcon = <svg data-testid="custom-icon" />;
      render(
        <NavButton
          label="Icon Button"
          href={PUBLIC_ROUTES.HOME}
          icon={testIcon}
        />,
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      expect(screen.getByText('Icon Button')).toBeInTheDocument();
    });
  });

  describe('Size prop', () => {
    it('uses default size "lg" when size prop is not provided', () => {
      render(<NavButton label="Default Size" href="/" />);
      expect(screen.getByText('Default Size')).toBeInTheDocument();
    });

    it('applies small size correctly', () => {
      render(<NavButton label="Small" href="/" size="sm" />);
      expect(screen.getByText('Small')).toBeInTheDocument();
    });

    it('applies medium size correctly', () => {
      render(<NavButton label="Medium" href="/" size="md" />);
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });

    it('applies large size correctly', () => {
      render(<NavButton label="Large" href="/" size="lg" />);
      expect(screen.getByText('Large')).toBeInTheDocument();
    });

    it('applies extra large size correctly', () => {
      render(<NavButton label="XL" href="/" size="xl" />);
      expect(screen.getByText('XL')).toBeInTheDocument();
    });
  });

  describe('FullWidth prop', () => {
    it('is not full width by default', () => {
      render(<NavButton label="Not Full" href="/" />);
      expect(screen.getByText('Not Full')).toBeInTheDocument();
    });

    it('applies full width when fullWidth is true', () => {
      render(
        <NavButton label="Full Width" href="/" fullWidth={true} />,
      );
      expect(screen.getByText('Full Width')).toBeInTheDocument();
    });

    it('is not full width when fullWidth is explicitly false', () => {
      render(
        <NavButton label="Not Full" href="/" fullWidth={false} />,
      );
      expect(screen.getByText('Not Full')).toBeInTheDocument();
    });
  });

  describe('Gradient styling', () => {
    it('applies gradient variant', () => {
      render(<NavButton label="Gradient" href="/" />);
      expect(screen.getByText('Gradient')).toBeInTheDocument();
    });

    it('has gradient class from CSS module', () => {
      render(<NavButton label="Nav Button" href="/" />);
      expect(screen.getByText('Nav Button')).toBeInTheDocument();
    });
  });

  describe('Different href values', () => {
    it('renders with root path', () => {
      render(<NavButton label="Home" href="/" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/');
    });

    it('renders with nested path', () => {
      render(
        <NavButton label="About" href={PUBLIC_ROUTES.ABOUT as Route} />,
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', PUBLIC_ROUTES.ABOUT);
    });

    it('renders with deep nested path', () => {
      render(
        <NavButton label="Profile" href={PROTECTED_ROUTES.PROFILE} />,
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', PROTECTED_ROUTES.PROFILE);
    });
  });

  describe('Combined props', () => {
    it('renders with all props combined', () => {
      const icon = <svg data-testid="combined-icon" />;
      render(
        <NavButton
          label="Complete Button"
          href="/"
          icon={icon}
          size="md"
          fullWidth={true}
        />,
      );
      expect(screen.getByText('Complete Button')).toBeInTheDocument();
      expect(screen.getByTestId('combined-icon')).toBeInTheDocument();
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/');
    });

    it('renders with icon and fullWidth', () => {
      const icon = <svg data-testid="icon-full" />;
      render(
        <NavButton label="Full Icon" href="/" icon={icon} fullWidth={true} />,
      );
      expect(screen.getByTestId('icon-full')).toBeInTheDocument();
      expect(screen.getByText('Full Icon')).toBeInTheDocument();
    });

    it('renders with custom size and icon', () => {
      const icon = <svg data-testid="icon-size" />;
      render(
        <NavButton label="Size Icon" href="/" icon={icon} size="sm" />,
      );
      expect(screen.getByTestId('icon-size')).toBeInTheDocument();
      expect(screen.getByText('Size Icon')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible link role', () => {
      render(<NavButton label="Accessible" href="/" />);
      const link = screen.getByRole('link', { name: /Accessible/i });
      expect(link).toBeInTheDocument();
    });

    it('renders as accessible link element', () => {
      render(
        <NavButton label="Link Button" href={PUBLIC_ROUTES.HOME} />,
      );
      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('maintains button text for screen readers', () => {
      render(<NavButton label="Screen Reader Text" href="/" />);
      expect(screen.getByText('Screen Reader Text')).toBeInTheDocument();
    });
  });

  describe('Label variations', () => {
    it('renders with short label', () => {
      render(<NavButton label="Go" href="/" />);
      expect(screen.getByText('Go')).toBeInTheDocument();
    });

    it('renders with long label', () => {
      const longLabel = 'This is a very long button label for testing';
      render(<NavButton label={longLabel} href="/" />);
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it('renders with label containing special characters', () => {
      render(<NavButton label="Save & Continue" href="/" />);
      expect(screen.getByText('Save & Continue')).toBeInTheDocument();
    });

    it('renders with label containing numbers', () => {
      render(<NavButton label="Page 1 of 10" href="/" />);
      expect(screen.getByText('Page 1 of 10')).toBeInTheDocument();
    });

    it('renders with label containing unicode characters', () => {
      render(<NavButton label="Vissza 🏠" href="/" />);
      expect(screen.getByText('Vissza 🏠')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('renders with empty string label', () => {
      render(<NavButton label="" href="/" />);
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    it('renders with all optional props omitted', () => {
      render(<NavButton label="Minimal" href="/" />);
      expect(screen.getByText('Minimal')).toBeInTheDocument();
    });
  });

  describe('Button structure', () => {
    it('renders as a link with button styling', () => {
      render(<NavButton label="Button" href="/" />);
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(screen.getByText('Button')).toBeInTheDocument();
    });

    it('combines Link and Button components', () => {
      render(<NavButton label="Mantine" href="/" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/');
      expect(screen.getByText('Mantine')).toBeInTheDocument();
    });
  });
});
