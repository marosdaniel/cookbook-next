import type React from 'react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Logo from './Logo';

// Mock useGlobal
vi.mock('../../lib/store', () => ({
  useGlobal: () => ({
    isDarkMode: false,
  }),
}));

// Mock next/link
vi.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({
      children,
      href,
    }: {
      children: React.ReactNode;
      href: string;
    }) => <a href={href}>{children}</a>,
  };
});

describe('Logo', () => {
  it('renders the CookBook title', () => {
    render(
      <MantineProvider>
        <Logo />
      </MantineProvider>,
    );
    expect(screen.getByText('CookBook')).toBeInTheDocument();
  });

  it('renders with correct heading level when headingSize is provided', () => {
    render(
      <MantineProvider>
        <Logo headingSize={1} />
      </MantineProvider>,
    );
    const title = screen.getByText('CookBook');
    expect(title.tagName).toBe('H1');
  });
});
