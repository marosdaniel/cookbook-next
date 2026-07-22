import '@testing-library/jest-dom';
import type { CSSProperties, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import UnderConstruction from './UnderConstruction';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Under Construction',
      subtitle: 'We are cooking up something special!',
      description:
        'This page is currently being prepared. Please check back soon.',
      backButton: 'Back to Home',
      browseRecipes: 'Browse Recipes',
      gradientIconTitle: 'Cooking pot icon with gradient',
    };
    return translations[key] || key;
  },
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock react-icons
vi.mock('react-icons/gi', () => ({
  GiCookingPot: ({ style }: { style: CSSProperties }) => (
    <svg data-testid="cooking-pot-icon" style={style}>
      <title>Cooking Pot Icon</title>
    </svg>
  ),
}));

vi.mock('react-icons/fi', () => ({
  FiArrowLeft: ({ size }: { size: number }) => (
    <svg data-testid="arrow-left-icon" width={size} height={size}>
      <title>Arrow Left Icon</title>
    </svg>
  ),
  FiBookOpen: ({ size }: { size: number }) => (
    <svg data-testid="book-open-icon" width={size} height={size}>
      <title>Book Open Icon</title>
    </svg>
  ),
}));

// Mock NavButton component
vi.mock('../buttons/NavButton', () => ({
  default: ({
    label,
    href,
    icon,
    dataTestId,
  }: {
    label: string;
    href: string;
    icon: ReactNode;
    dataTestId?: string;
  }) => (
    <a href={href} data-testid={dataTestId ?? 'nav-button'}>
      {icon}
      <button type="button">{label}</button>
    </a>
  ),
}));

// Mock StyledText component
vi.mock('../StyledText', () => ({
  default: ({
    componentType,
    gradient,
    className,
    order,
    children,
  }: {
    componentType?: string;
    gradient?: boolean;
    className?: string;
    order?: number;
    children: ReactNode;
  }) => {
    const Component = componentType === 'title' ? 'h1' : 'div';
    return (
      <Component
        data-testid="styled-text"
        data-component-type={componentType}
        data-gradient={gradient}
        data-order={order}
        className={className}
      >
        {children}
      </Component>
    );
  },
}));

describe('UnderConstruction', () => {
  describe('Basic rendering', () => {
    it('renders the component', () => {
      const { container } = render(<UnderConstruction />);
      expect(container).toBeInTheDocument();
    });

    it('renders the container element', () => {
      const { container } = render(<UnderConstruction />);
      const mantineContainer = container.querySelector(
        '.mantine-Container-root',
      );
      expect(mantineContainer).toBeInTheDocument();
    });
  });

  describe('Icon rendering', () => {
    it('renders the cooking pot icon', () => {
      render(<UnderConstruction />);
      const icon = screen.getByTestId('cooking-pot-icon');
      expect(icon).toBeInTheDocument();
    });

    it('cooking pot icon has gradient fill', () => {
      render(<UnderConstruction />);
      const icon = screen.getByTestId('cooking-pot-icon');
      expect(icon).toHaveStyle({ fill: 'url(#pot-gradient)' });
    });

    it('renders SVG gradient definition', () => {
      const { container } = render(<UnderConstruction />);
      const linearGradient = container.querySelector(
        'linearGradient#pot-gradient',
      );
      expect(linearGradient).toBeInTheDocument();
    });

    it('gradient has correct id', () => {
      const { container } = render(<UnderConstruction />);
      const linearGradient = container.querySelector('#pot-gradient');
      expect(linearGradient).toHaveAttribute('id', 'pot-gradient');
    });

    it('gradient has correct coordinates', () => {
      const { container } = render(<UnderConstruction />);
      const linearGradient = container.querySelector('#pot-gradient');
      expect(linearGradient).toHaveAttribute('x1', '100%');
      expect(linearGradient).toHaveAttribute('y1', '100%');
      expect(linearGradient).toHaveAttribute('x2', '0%');
      expect(linearGradient).toHaveAttribute('y2', '0%');
    });

    it.each([
      {
        label: 'first',
        selector: 'linearGradient#pot-gradient stop:first-child',
        expectedStopColor: 'var(--mantine-color-pink-6)',
        expectedOffset: '0%',
      },
      {
        label: 'second',
        selector: 'linearGradient#pot-gradient stop:last-child',
        expectedStopColor: 'var(--mantine-color-violet-6)',
        expectedOffset: '100%',
      },
    ])(
      'gradient $label stop is rendered correctly',
      ({ selector, expectedStopColor, expectedOffset }) => {
        const { container } = render(<UnderConstruction />);
        const stops = container.querySelectorAll(
          'linearGradient#pot-gradient stop',
        );
        expect(stops).toHaveLength(2);

        const stop = container.querySelector(selector);
        expect(stop).toHaveAttribute('stop-color', expectedStopColor);
        expect(stop).toHaveAttribute('offset', expectedOffset);
      },
    );

    it('SVG has title for accessibility', () => {
      const { container } = render(<UnderConstruction />);
      const svgTitle = container.querySelector('svg title');
      expect(svgTitle).toBeInTheDocument();
      expect(svgTitle?.textContent).toBe('Cooking Pot Icon');
    });
  });

  describe('Title rendering', () => {
    it('renders the main title', () => {
      render(<UnderConstruction />);
      const title = screen.getByTestId('underconstruction-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Under Construction');
    });

    it('title is rendered as StyledText with title component type', () => {
      render(<UnderConstruction />);
      const styled = screen.getByTestId('styled-text');
      expect(styled).toHaveAttribute('data-component-type', 'title');
    });

    it('title has gradient applied', () => {
      render(<UnderConstruction />);
      const styled = screen.getByTestId('styled-text');
      expect(styled).toHaveAttribute('data-gradient', 'true');
    });

    it('title has correct order', () => {
      render(<UnderConstruction />);
      const styled = screen.getByTestId('styled-text');
      expect(styled).toHaveAttribute('data-order', '1');
    });

    it('title has custom class', () => {
      render(<UnderConstruction />);
      const styled = screen.getByTestId('styled-text');
      expect(styled.className).toContain('title');
    });
  });

  describe('Subtitle rendering', () => {
    it('renders the subtitle', () => {
      render(<UnderConstruction />);
      const subtitle = screen.getByTestId('underconstruction-subtitle');
      expect(subtitle).toBeInTheDocument();
      expect(subtitle).toHaveTextContent(
        'We are cooking up something special!',
      );
    });

    it('subtitle is a Mantine Text component', () => {
      render(<UnderConstruction />);
      const subtitle = screen.getByTestId('underconstruction-subtitle');
      const textElement = subtitle.closest('.mantine-Text-root');
      expect(textElement).toBeInTheDocument();
    });
  });

  describe('Description rendering', () => {
    it('renders the description text', () => {
      render(<UnderConstruction />);
      const description = screen.getByTestId('underconstruction-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent(
        'This page is currently being prepared. Please check back soon.',
      );
    });

    it('description is a Mantine Text component', () => {
      render(<UnderConstruction />);
      const description = screen.getByTestId('underconstruction-description');
      const textElement = description.closest('.mantine-Text-root');
      expect(textElement).toBeInTheDocument();
    });
  });

  describe('Navigation button', () => {
    it('renders the NavButton component', () => {
      render(<UnderConstruction />);
      const navButton = screen.getByTestId('underconstruction-back');
      expect(navButton).toBeInTheDocument();
    });

    it('NavButton has correct label', () => {
      render(<UnderConstruction />);
      const button = screen.getByTestId('underconstruction-back');
      expect(button).toHaveTextContent('Back to Home');
    });

    it('NavButton links to homepage', () => {
      render(<UnderConstruction />);
      const navButton = screen.getByTestId('underconstruction-back');
      expect(navButton).toHaveAttribute('href', '/');
    });

    it('NavButton includes arrow icon', () => {
      render(<UnderConstruction />);
      const arrowIcon = screen.getByTestId('arrow-left-icon');
      expect(arrowIcon).toBeInTheDocument();
    });

    it('arrow icon has correct size', () => {
      render(<UnderConstruction />);
      const arrowIcon = screen.getByTestId('arrow-left-icon');
      expect(arrowIcon).toHaveAttribute('width', '20');
      expect(arrowIcon).toHaveAttribute('height', '20');
    });
  });

  describe('Translations integration', () => {
    it('uses translations for title', () => {
      render(<UnderConstruction />);
      expect(screen.getByTestId('underconstruction-title')).toHaveTextContent(
        'Under Construction',
      );
    });

    it('uses translations for subtitle', () => {
      render(<UnderConstruction />);
      expect(
        screen.getByTestId('underconstruction-subtitle'),
      ).toHaveTextContent('We are cooking up something special!');
    });

    it('uses translations for description', () => {
      render(<UnderConstruction />);
      expect(
        screen.getByTestId('underconstruction-description'),
      ).toHaveTextContent(
        'This page is currently being prepared. Please check back soon.',
      );
    });

    it('uses translations for button label', () => {
      render(<UnderConstruction />);
      expect(screen.getByTestId('underconstruction-back')).toHaveTextContent(
        'Back to Home',
      );
    });

    it('renders an accessible icon title', () => {
      const { container } = render(<UnderConstruction />);
      const svgTitle = container.querySelector('svg title');
      expect(svgTitle?.textContent).toBe('Cooking Pot Icon');
    });
  });

  describe('Component structure', () => {
    it('has correct element hierarchy', () => {
      render(<UnderConstruction />);

      // Check for icon section
      expect(screen.getByTestId('cooking-pot-icon')).toBeInTheDocument();

      // Check for title
      expect(screen.getByTestId('underconstruction-title')).toHaveTextContent(
        'Under Construction',
      );

      const iconWrapper = document.querySelector('[class*="iconWrapper"]');
      expect(iconWrapper).toBeInTheDocument();
    });

    it('renders all main sections in correct order', () => {
      render(<UnderConstruction />);

      // Check for icon section
      expect(screen.getByTestId('cooking-pot-icon')).toBeInTheDocument();

      // Check for title
      expect(screen.getByTestId('underconstruction-title')).toHaveTextContent(
        'Under Construction',
      );

      // Check for subtitle
      expect(
        screen.getByTestId('underconstruction-subtitle'),
      ).toHaveTextContent('We are cooking up something special!');

      // Check for description
      expect(
        screen.getByTestId('underconstruction-description'),
      ).toHaveTextContent(
        'This page is currently being prepared. Please check back soon.',
      );

      // Check for button
      expect(screen.getByTestId('underconstruction-back')).toBeInTheDocument();
    });

    it('icon wrapper contains SVG and icon', () => {
      const { container } = render(<UnderConstruction />);
      const iconWrapper = container.querySelector('[class*="iconWrapper"]');
      expect(iconWrapper).toBeInTheDocument();

      const svg = iconWrapper?.querySelector('svg');
      expect(svg).toBeInTheDocument();

      const icon = screen.getByTestId('cooking-pot-icon');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('CSS classes', () => {
    it('container has custom CSS class', () => {
      render(<UnderConstruction />);
      const element = document.querySelector('[class*="container"]');
      expect(element).toBeInTheDocument();
    });

    it('icon wrapper has custom CSS class', () => {
      render(<UnderConstruction />);
      const element = document.querySelector('[class*="iconWrapper"]');
      expect(element).toBeInTheDocument();
    });

    it('title has custom CSS class', () => {
      render(<UnderConstruction />);
      const styledText = screen.getByTestId('styled-text');
      expect(styledText.className).toContain('title');
    });
  });

  describe('Complete component render', () => {
    it('renders all essential elements together', () => {
      render(<UnderConstruction />);

      // Icon
      expect(screen.getByTestId('cooking-pot-icon')).toBeInTheDocument();

      // Text elements
      expect(screen.getByTestId('underconstruction-title')).toHaveTextContent(
        'Under Construction',
      );
      expect(
        screen.getByTestId('underconstruction-subtitle'),
      ).toHaveTextContent('We are cooking up something special!');
      expect(
        screen.getByTestId('underconstruction-description'),
      ).toHaveTextContent(
        'This page is currently being prepared. Please check back soon.',
      );

      // Navigation
      expect(screen.getByTestId('underconstruction-back')).toHaveTextContent(
        'Back to Home',
      );
      expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible button', () => {
      render(<UnderConstruction />);
      const button = screen.getByRole('button', { name: 'Back to Home' });
      expect(button).toBeInTheDocument();
    });

    it('has accessible heading', () => {
      render(<UnderConstruction />);
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
    });

    it('SVG has accessible title', () => {
      const { container } = render(<UnderConstruction />);
      const title = container.querySelector('svg title');
      expect(title).toBeInTheDocument();
      expect(title?.textContent).toBe('Cooking Pot Icon');
    });

    it('link is accessible', () => {
      render(<UnderConstruction />);
      const link = screen.getByRole('link', { name: /Back to Home/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/');
    });
  });
});
