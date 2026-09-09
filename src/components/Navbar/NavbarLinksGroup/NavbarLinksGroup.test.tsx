import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PUBLIC_ROUTES } from '../../../types/routes';
import NavbarLinksGroup from './NavbarLinksGroup';

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('NavbarLinksGroup', () => {
  beforeEach(() =>
    vi.mocked(usePathname).mockReturnValue(PUBLIC_ROUTES.RECIPES),
  );
  const render = (ui: React.ReactElement) =>
    rtlRender(<MantineProvider>{ui}</MantineProvider>);

  it('renders a direct link and marks it active', () => {
    render(<NavbarLinksGroup label="Recipes" link={PUBLIC_ROUTES.RECIPES} />);

    const control = screen.getByTestId(
      `navbar-control-${PUBLIC_ROUTES.RECIPES}`,
    );
    expect(control).toHaveAttribute('href', PUBLIC_ROUTES.RECIPES);
    expect(control).toHaveAttribute('data-active', 'true');
    expect(
      screen.queryByTestId('navbar-group-Recipes'),
    ).not.toBeInTheDocument();
  });

  it('renders a direct inactive link without an indicator', () => {
    vi.mocked(usePathname).mockReturnValue('/other');
    const { container } = render(
      <NavbarLinksGroup label="Recipes" link={PUBLIC_ROUTES.RECIPES} />,
    );

    expect(
      screen.getByTestId(`navbar-control-${PUBLIC_ROUTES.RECIPES}`),
    ).not.toHaveAttribute('data-active');
    expect(
      container.querySelector('[class*="activeIndicator"]'),
    ).not.toBeInTheDocument();
  });

  it('opens a group initially and shows its active child', () => {
    render(
      <NavbarLinksGroup
        label="Recipe menu"
        links={[{ label: 'All recipes', link: PUBLIC_ROUTES.RECIPES }]}
      />,
    );

    const group = screen.getByTestId('navbar-group-Recipe menu');
    expect(group).toHaveAttribute('aria-expanded', 'true');
    expect(group).toHaveAttribute('data-active-child', 'true');
    expect(screen.getByTestId('navbar-link-All recipes')).toBeInTheDocument();
  });

  it('toggles a closed group and handles numeric labels', () => {
    vi.mocked(usePathname).mockReturnValue('/other');
    render(
      <NavbarLinksGroup
        label={42}
        initiallyOpened={false}
        links={[{ label: 'Recipes', link: PUBLIC_ROUTES.RECIPES }]}
      />,
    );

    const group = screen.getByTestId('navbar-group-42');
    expect(group).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(group);
    expect(group).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(group);
    expect(group).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders a group without links without collapse content', () => {
    render(<NavbarLinksGroup label="Standalone" />);

    const group = screen.getByTestId('navbar-group-Standalone');
    expect(group).not.toHaveAttribute('aria-expanded');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
