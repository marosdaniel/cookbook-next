import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';
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
  it('renders the 404 title', () => {
    render(<NotFound />);
    const title = screen.getByText('404');
    expect(title).toBeInTheDocument();
  });

  it('renders the main heading with Hungarian text', () => {
    render(<NotFound />);
    const heading = screen.getByTestId('notfound-heading');
    expect(heading).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<NotFound />);
    const description = screen.getByTestId('notfound-description');
    expect(description).toBeInTheDocument();
  });

  it('renders the additional hint text', () => {
    render(<NotFound />);
    const hint = screen.getByTestId('notfound-hint');
    expect(hint).toBeInTheDocument();
  });

  it('renders the chef hat icon', () => {
    render(<NotFound />);
    const chefHatIcon = screen.getByTestId('icon-chef-hat');
    expect(chefHatIcon).toBeInTheDocument();
  });

  it('renders the home icon in the button', () => {
    render(<NotFound />);
    const homeIcon = screen.getByTestId('icon-home');
    expect(homeIcon).toBeInTheDocument();
  });

  it('renders a link to the homepage', () => {
    render(<NotFound />);
    const linkButtons = screen.getAllByText('Vissza a főoldalra');
    expect(linkButtons[0].closest('a')).toHaveAttribute('href', '/');
  });

  it('renders the link button with correct text', () => {
    render(<NotFound />);
    const linkButtons = screen.getAllByText('Vissza a főoldalra');
    expect(linkButtons.length).toBeGreaterThan(0);
    expect(linkButtons[0]).toBeInTheDocument();
  });

  it('renders all main sections', () => {
    render(<NotFound />);

    // Check for presence of all key elements
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByTestId('icon-chef-hat')).toBeInTheDocument();
    expect(screen.getByTestId('notfound-heading')).toBeInTheDocument();
    const linkButtons = screen.getAllByText('Vissza a főoldalra');
    expect(linkButtons.length).toBeGreaterThan(0);
    expect(linkButtons[0].closest('a')).toHaveAttribute('href', '/');
  });

  it('applies correct container size', () => {
    const { container } = render(<NotFound />);
    const mantineContainer = container.querySelector('.mantine-Container-root');
    expect(mantineContainer).toBeInTheDocument();
  });

  it('chef hat icon has correct opacity styling', () => {
    render(<NotFound />);
    const chefHatIcon = screen.getByTestId('icon-chef-hat');
    expect(chefHatIcon).toHaveStyle({ opacity: 0.5 });
  });

  it('chef hat icon has correct size', () => {
    render(<NotFound />);
    const chefHatIcon = screen.getByTestId('icon-chef-hat');
    expect(chefHatIcon).toHaveAttribute('width', '120');
    expect(chefHatIcon).toHaveAttribute('height', '120');
  });

  it('home icon has correct size', () => {
    render(<NotFound />);
    const homeIcon = screen.getByTestId('icon-home');
    expect(homeIcon).toHaveAttribute('width', '20');
    expect(homeIcon).toHaveAttribute('height', '20');
  });
});
