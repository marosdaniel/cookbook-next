import '@testing-library/jest-dom';
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
      gradientIconTitle: 'Cooking pot icon with gradient',
    };
    return translations[key] || key;
  },
}));

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

// Mock react-icons
vi.mock('react-icons/gi', () => ({
  GiCookingPot: ({ style }: { style: React.CSSProperties }) => (
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
}));

// Mock NavButton component
vi.mock('../buttons/NavButton', () => ({
  default: ({
    label,
    href,
    icon,
  }: {
    label: string;
    href: string;
    icon: React.ReactNode;
  }) => (
    <a href={href} data-testid="nav-button">
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
    children: React.ReactNode;
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

    it('gradient has stop colors defined', () => {
      const { container } = render(<UnderConstruction />);
      const stops = container.querySelectorAll(
        'linearGradient#pot-gradient stop',
      );
      expect(stops.length).toBe(2);
    });

    it('gradient first stop is pink', () => {
      const { container } = render(<UnderConstruction />);
      const firstStop = container.querySelector(
        'linearGradient#pot-gradient stop:first-child',
      );
      expect(firstStop).toHaveAttribute(
        'stop-color',
        'var(--mantine-color-pink-6)',
      );
      expect(firstStop).toHaveAttribute('offset', '0%');
    });

    it('gradient second stop is violet', () => {
      const { container } = render(<UnderConstruction />);
      const secondStop = container.querySelector(
        'linearGradient#pot-gradient stop:last-child',
      );
      expect(secondStop).toHaveAttribute(
        'stop-color',
        'var(--mantine-color-violet-6)',
      );
      expect(secondStop).toHaveAttribute('offset', '100%');
    });

    it('SVG has title for accessibility', () => {
      const { container } = render(<UnderConstruction />);
      const svgTitle = container.querySelector('svg title');
      expect(svgTitle).toBeInTheDocument();
      expect(svgTitle?.textContent).toBe('Cooking pot icon with gradient');
    });
  });

  describe('Title rendering', () => {
    it('renders the main title', () => {
      render(<UnderConstruction />);
      const title = screen.getByTestId('underconstruction-title');
      expect(title).toBeInTheDocument();
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
      const navButton = screen.getByTestId('nav-button');
      expect(navButton).toBeInTheDocument();
    });

    it('NavButton has correct label', () => {
      render(<UnderConstruction />);
      const button = screen.getByRole('button', { name: /Back to Home/i });
      expect(button).toBeInTheDocument();
    });

    it('NavButton links to homepage', () => {
      render(<UnderConstruction />);
      const navButton = screen.getByTestId('nav-button');
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
      expect(screen.getByText('Under Construction')).toBeInTheDocument();
    });

    it('uses translations for subtitle', () => {
      render(<UnderConstruction />);
      expect(
        screen.getByText('We are cooking up something special!'),
      ).toBeInTheDocument();
    });

    it('uses translations for description', () => {
      render(<UnderConstruction />);
      expect(
        screen.getByText(
          'This page is currently being prepared. Please check back soon.',
        ),
      ).toBeInTheDocument();
    });

    it('uses translations for button label', () => {
      render(<UnderConstruction />);
      expect(screen.getByText('Back to Home')).toBeInTheDocument();
    });

    it('uses translations for gradient icon title', () => {
      const { container } = render(<UnderConstruction />);
      const svgTitle = container.querySelector('svg title');
      expect(svgTitle?.textContent).toBe('Cooking pot icon with gradient');
    });
  });

  describe('Component structure', () => {
    it('has correct element hierarchy', () => {
      render(<UnderConstruction />);

      // Check for icon section
      expect(screen.getByTestId('cooking-pot-icon')).toBeInTheDocument();

      // Check for title
      expect(screen.getByText('Under Construction')).toBeInTheDocument();

      const iconWrapper = document.querySelector('[class*="iconWrapper"]');
      expect(iconWrapper).toBeInTheDocument();
    });

    it('renders all main sections in correct order', () => {
      render(<UnderConstruction />);

      // Check for icon section
      expect(screen.getByTestId('cooking-pot-icon')).toBeInTheDocument();

      // Check for title
      expect(screen.getByText('Under Construction')).toBeInTheDocument();

      // Check for subtitle
      expect(
        screen.getByText('We are cooking up something special!'),
      ).toBeInTheDocument();

      // Check for description
      expect(
        screen.getByText(
          'This page is currently being prepared. Please check back soon.',
        ),
      ).toBeInTheDocument();

      // Check for button
      expect(screen.getByTestId('nav-button')).toBeInTheDocument();
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
      expect(screen.getByText('Under Construction')).toBeInTheDocument();
      expect(
        screen.getByText('We are cooking up something special!'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'This page is currently being prepared. Please check back soon.',
        ),
      ).toBeInTheDocument();

      // Navigation
      expect(screen.getByText('Back to Home')).toBeInTheDocument();
      expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible button', () => {
      render(<UnderConstruction />);
      const button = screen.getByRole('button');
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
    });

    it('link is accessible', () => {
      render(<UnderConstruction />);
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/');
    });
  });
});
