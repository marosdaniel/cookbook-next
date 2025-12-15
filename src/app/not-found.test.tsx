import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NotFound from './not-found';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: '404',
      heading: 'Úgy néz ki, ez a recept nem létezik! 🍳',
      description: 'A keresett oldal nincs a szakácskönyvünkben.',
      hint: 'Lehet, hogy elfogyott, vagy sosem is volt a menüben...',
      backButton: 'Vissza a főoldalra',
    };
    return translations[key] || key;
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

// Mock react-icons
vi.mock('react-icons/gi', () => ({
  GiChefToque: ({
    size,
    style,
  }: {
    size: number;
    style: React.CSSProperties;
  }) => (
    <svg data-testid="icon-chef-hat" width={size} height={size} style={style} />
  ),
}));

vi.mock('react-icons/fi', () => ({
  FiHome: ({ size }: { size: number }) => (
    <svg data-testid="icon-home" width={size} height={size} />
  ),
}));

describe('NotFound', () => {
  const renderWithMantine = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
  };

  it('renders the 404 title', () => {
    renderWithMantine(<NotFound />);
    const title = screen.getByText('404');
    expect(title).toBeInTheDocument();
  });

  it('renders the main heading with Hungarian text', () => {
    renderWithMantine(<NotFound />);
    const heading = screen.getByText(/Úgy néz ki, ez a recept nem létezik!/i);
    expect(heading).toBeInTheDocument();
  });

  it('renders the description text', () => {
    renderWithMantine(<NotFound />);
    const description = screen.getByText(
      /A keresett oldal nincs a szakácskönyvünkben/i,
    );
    expect(description).toBeInTheDocument();
  });

  it('renders the additional hint text', () => {
    renderWithMantine(<NotFound />);
    const hint = screen.getByText(
      /Lehet, hogy elfogyott, vagy sosem is volt a menüben/i,
    );
    expect(hint).toBeInTheDocument();
  });

  it('renders the chef hat icon', () => {
    renderWithMantine(<NotFound />);
    const chefHatIcon = screen.getByTestId('icon-chef-hat');
    expect(chefHatIcon).toBeInTheDocument();
  });

  it('renders the home icon in the button', () => {
    renderWithMantine(<NotFound />);
    const homeIcon = screen.getByTestId('icon-home');
    expect(homeIcon).toBeInTheDocument();
  });

  it('renders a link to the homepage', () => {
    renderWithMantine(<NotFound />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders the button with correct text', () => {
    renderWithMantine(<NotFound />);
    const button = screen.getByRole('button', { name: /Vissza a főoldalra/i });
    expect(button).toBeInTheDocument();
  });

  it('renders all main sections', () => {
    renderWithMantine(<NotFound />);

    // Check for presence of all key elements
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByTestId('icon-chef-hat')).toBeInTheDocument();
    expect(screen.getByText(/Úgy néz ki/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('applies correct container size', () => {
    const { container } = renderWithMantine(<NotFound />);
    const mantineContainer = container.querySelector('.mantine-Container-root');
    expect(mantineContainer).toBeInTheDocument();
  });

  it('chef hat icon has correct opacity styling', () => {
    renderWithMantine(<NotFound />);
    const chefHatIcon = screen.getByTestId('icon-chef-hat');
    expect(chefHatIcon).toHaveStyle({ opacity: 0.5 });
  });

  it('chef hat icon has correct size', () => {
    renderWithMantine(<NotFound />);
    const chefHatIcon = screen.getByTestId('icon-chef-hat');
    expect(chefHatIcon).toHaveAttribute('width', '120');
    expect(chefHatIcon).toHaveAttribute('height', '120');
  });

  it('home icon has correct size', () => {
    renderWithMantine(<NotFound />);
    const homeIcon = screen.getByTestId('icon-home');
    expect(homeIcon).toHaveAttribute('width', '20');
    expect(homeIcon).toHaveAttribute('height', '20');
  });
});
