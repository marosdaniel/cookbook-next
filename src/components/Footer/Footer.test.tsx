import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Footer from './Footer';

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

// Mock Logo component
vi.mock('../Logo', () => ({
  Logo: ({
    variant,
    width,
    height,
    withText,
    href,
  }: {
    variant: string;
    width: number;
    height: number;
    withText: boolean;
    href: string;
  }) => (
    <a
      href={href}
      data-testid="logo"
      data-variant={variant}
      data-width={width}
      data-height={height}
      data-with-text={withText}
    >
      Logo
    </a>
  ),
}));

// Mock PUBLIC_ROUTES
vi.mock('../../types/routes', () => ({
  PUBLIC_ROUTES: {
    HOME: '/',
    PRIVACY_POLICY: '/privacy-policy',
    COOKIE_POLICY: '/cookie-policy',
  },
}));

describe('Footer', () => {
  const renderWithMantine = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
  };

  describe('Basic rendering', () => {
    it('renders the footer component', () => {
      const { container } = renderWithMantine(<Footer />);
      expect(container).toBeInTheDocument();
    });

    it('renders both mobile and desktop versions', () => {
      const { container } = renderWithMantine(<Footer />);
      const stacks = container.querySelectorAll('.mantine-Stack-root');
      const groups = container.querySelectorAll('.mantine-Group-root');
      expect(stacks.length).toBeGreaterThan(0);
      expect(groups.length).toBeGreaterThan(0);
    });
  });

  describe('Logo rendering', () => {
    it('renders logo in mobile footer', () => {
      renderWithMantine(<Footer />);
      const logos = screen.getAllByTestId('logo');
      expect(logos.length).toBeGreaterThanOrEqual(1);
    });

    it('renders logo in desktop footer', () => {
      renderWithMantine(<Footer />);
      const logos = screen.getAllByTestId('logo');
      expect(logos.length).toBe(2); // One for mobile, one for desktop
    });

    it('renders logo with correct variant', () => {
      renderWithMantine(<Footer />);
      const logos = screen.getAllByTestId('logo');
      logos.forEach((logo) => {
        expect(logo).toHaveAttribute('data-variant', 'icon');
      });
    });

    it('renders logo with correct dimensions', () => {
      renderWithMantine(<Footer />);
      const logos = screen.getAllByTestId('logo');
      logos.forEach((logo) => {
        expect(logo).toHaveAttribute('data-width', '36');
        expect(logo).toHaveAttribute('data-height', '36');
      });
    });

    it('renders logo with text', () => {
      renderWithMantine(<Footer />);
      const logos = screen.getAllByTestId('logo');
      logos.forEach((logo) => {
        expect(logo).toHaveAttribute('data-with-text', 'true');
      });
    });

    it('renders logo with correct href', () => {
      renderWithMantine(<Footer />);
      const logos = screen.getAllByTestId('logo');
      logos.forEach((logo) => {
        expect(logo).toHaveAttribute('href', '/');
      });
    });
  });

  describe('Copyright text', () => {
    it('renders copyright symbol', () => {
      renderWithMantine(<Footer />);
      const copyrightTexts = screen.getAllByText(/©/);
      expect(copyrightTexts.length).toBeGreaterThan(0);
    });

    it('renders current year in copyright', () => {
      const currentYear = new Date().getFullYear();
      renderWithMantine(<Footer />);
      const copyrightTexts = screen.getAllByText(
        new RegExp(`© ${currentYear}`),
      );
      expect(copyrightTexts.length).toBeGreaterThan(0);
    });

    it('renders "Cookbook" in copyright text', () => {
      renderWithMantine(<Footer />);
      const copyrightTexts = screen.getAllByText(/Cookbook/);
      expect(copyrightTexts.length).toBeGreaterThan(0);
    });

    it('renders "All rights reserved" text', () => {
      renderWithMantine(<Footer />);
      const copyrightTexts = screen.getAllByText(/All rights reserved/);
      expect(copyrightTexts.length).toBeGreaterThan(0);
    });

    it('renders full copyright text correctly', () => {
      const currentYear = new Date().getFullYear();
      renderWithMantine(<Footer />);
      const copyrightTexts = screen.getAllByText(
        `© ${currentYear} Cookbook. All rights reserved.`,
      );
      expect(copyrightTexts).toHaveLength(2); // Mobile and desktop
    });
  });

  describe('Privacy Policy link', () => {
    it('renders Privacy Policy links', () => {
      renderWithMantine(<Footer />);
      const privacyLinks = screen.getAllByText('Privacy Policy');
      expect(privacyLinks).toHaveLength(2); // Mobile and desktop
    });

    it('has correct href for Privacy Policy', () => {
      renderWithMantine(<Footer />);
      const privacyLinks = screen.getAllByText('Privacy Policy');
      privacyLinks.forEach((link) => {
        const anchorElement = link.closest('a');
        expect(anchorElement).toHaveAttribute('href', '/privacy-policy');
      });
    });
  });

  describe('Cookie Policy link', () => {
    it('renders Cookie Policy links', () => {
      renderWithMantine(<Footer />);
      const cookieLinks = screen.getAllByText('Cookie Policy');
      expect(cookieLinks).toHaveLength(2); // Mobile and desktop
    });

    it('has correct href for Cookie Policy', () => {
      renderWithMantine(<Footer />);
      const cookieLinks = screen.getAllByText('Cookie Policy');
      cookieLinks.forEach((link) => {
        const anchorElement = link.closest('a');
        expect(anchorElement).toHaveAttribute('href', '/cookie-policy');
      });
    });
  });

  describe('Mobile footer layout', () => {
    it('renders mobile footer stack', () => {
      renderWithMantine(<Footer />);
      // Check for Stack component by finding copyright text (which is in both mobile and desktop)
      const copyrightTexts = screen.getAllByText(
        /© .* Cookbook. All rights reserved./,
      );
      expect(copyrightTexts.length).toBeGreaterThan(0);
    });

    it('mobile footer has correct structure', () => {
      renderWithMantine(<Footer />);
      const logos = screen.getAllByTestId('logo');
      expect(logos[0]).toBeInTheDocument();
    });
  });

  describe('Desktop footer layout', () => {
    it('renders desktop footer group', () => {
      renderWithMantine(<Footer />);
      // Check for Group component by finding logos
      const logos = screen.getAllByTestId('logo');
      expect(logos.length).toBe(2);
    });

    it('desktop footer has correct structure', () => {
      renderWithMantine(<Footer />);
      const logos = screen.getAllByTestId('logo');
      expect(logos[1]).toBeInTheDocument();
    });
  });

  describe('All links together', () => {
    it('renders all navigation links', () => {
      renderWithMantine(<Footer />);
      const privacyLinks = screen.getAllByText('Privacy Policy');
      const cookieLinks = screen.getAllByText('Cookie Policy');
      expect(privacyLinks.length).toBe(2);
      expect(cookieLinks.length).toBe(2);
    });

    it('all links are clickable', () => {
      renderWithMantine(<Footer />);
      const allLinks = screen.getAllByRole('link');
      expect(allLinks.length).toBeGreaterThan(0);
      allLinks.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('Responsive behavior', () => {
    it('has mobile layout elements', () => {
      const { container } = renderWithMantine(<Footer />);
      const stacks = container.querySelectorAll('.mantine-Stack-root');
      expect(stacks.length).toBeGreaterThan(0);
    });

    it('has desktop layout elements', () => {
      const { container } = renderWithMantine(<Footer />);
      const groups = container.querySelectorAll('.mantine-Group-root');
      expect(groups.length).toBeGreaterThan(0);
    });
  });

  describe('Anchor component properties', () => {
    it('renders anchor links', () => {
      renderWithMantine(<Footer />);
      // Check for actual link elements
      const privacyLinks = screen.getAllByText('Privacy Policy');
      const cookieLinks = screen.getAllByText('Cookie Policy');
      expect(privacyLinks.length).toBe(2);
      expect(cookieLinks.length).toBe(2);
    });

    it('policy links have correct text content', () => {
      renderWithMantine(<Footer />);
      expect(screen.getAllByText('Privacy Policy')).toHaveLength(2);
      expect(screen.getAllByText('Cookie Policy')).toHaveLength(2);
    });
  });

  describe('Text component properties', () => {
    it('copyright text uses Mantine Text component', () => {
      const { container } = renderWithMantine(<Footer />);
      const textElements = container.querySelectorAll('.mantine-Text-root');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });

  describe('Fragment wrapper', () => {
    it('uses React Fragment as root element', () => {
      const { container } = renderWithMantine(<Footer />);
      // Fragment doesn't create a DOM element, so check for direct children
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders both mobile and desktop sections within fragment', () => {
      const { container } = renderWithMantine(<Footer />);
      const stack = container.querySelector('.mantine-Stack-root');
      const group = container.querySelector('.mantine-Group-root');
      expect(stack).toBeInTheDocument();
      expect(group).toBeInTheDocument();
    });
  });

  describe('Dynamic year calculation', () => {
    it('calculates year dynamically', () => {
      const currentYear = new Date().getFullYear();
      renderWithMantine(<Footer />);
      const yearTexts = screen.getAllByText(new RegExp(currentYear.toString()));
      expect(yearTexts.length).toBeGreaterThan(0);
    });

    it('year in copyright matches current year', () => {
      const currentYear = new Date().getFullYear();
      renderWithMantine(<Footer />);
      const copyrightText = screen.getAllByText(new RegExp(`© ${currentYear}`));
      expect(copyrightText.length).toBe(2);
    });
  });

  describe('Complete footer content', () => {
    it('renders all required elements', () => {
      renderWithMantine(<Footer />);

      // Check logos
      const logos = screen.getAllByTestId('logo');
      expect(logos.length).toBe(2);

      // Check copyright
      const currentYear = new Date().getFullYear();
      const copyright = screen.getAllByText(
        `© ${currentYear} Cookbook. All rights reserved.`,
      );
      expect(copyright.length).toBe(2);

      // Check policy links
      expect(screen.getAllByText('Privacy Policy')).toHaveLength(2);
      expect(screen.getAllByText('Cookie Policy')).toHaveLength(2);
    });

    it('maintains proper structure hierarchy', () => {
      const { container } = renderWithMantine(<Footer />);
      const groups = container.querySelectorAll('.mantine-Group-root');
      const stacks = container.querySelectorAll('.mantine-Stack-root');

      expect(groups.length + stacks.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('all links are accessible', () => {
      renderWithMantine(<Footer />);
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toBeInTheDocument();
      });
    });

    it('logo links have proper text content', () => {
      renderWithMantine(<Footer />);
      const logoLinks = screen.getAllByText('Logo');
      expect(logoLinks.length).toBe(2);
    });
  });
});
