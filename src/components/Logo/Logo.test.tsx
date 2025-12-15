import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LOGO_SRC_DARK, LOGO_SRC_LIGHT } from './consts';
import { Logo, LogoIcon } from './Logo';

// Mock useComputedColorScheme
const mockComputedColorScheme = vi.fn();
vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual('@mantine/core');
  return {
    ...actual,
    useComputedColorScheme: () => mockComputedColorScheme(),
  };
});

// Define proper types for Image mock props
interface ImageProps extends ComponentProps<'img'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, ...props }: ImageProps) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      data-testid="logo-image"
      {...props}
    />
  ),
}));

describe('Logo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockComputedColorScheme.mockReturnValue('light');
  });

  describe('Logo Component', () => {
    it('renders with correct alt text for default variant', () => {
      render(
        <MantineProvider>
          <Logo />
        </MantineProvider>,
      );
      const image = screen.getByAltText('Cookbook Logo');
      expect(image).toBeInTheDocument();
    });

    it('uses light logo in light mode', () => {
      mockComputedColorScheme.mockReturnValue('light');
      render(
        <MantineProvider>
          <Logo />
        </MantineProvider>,
      );
      const image = screen.getByTestId('logo-image');
      expect(image).toHaveAttribute('src', LOGO_SRC_LIGHT);
    });

    it('uses dark logo in dark mode', () => {
      mockComputedColorScheme.mockReturnValue('dark');
      render(
        <MantineProvider>
          <Logo />
        </MantineProvider>,
      );
      const image = screen.getByTestId('logo-image');
      expect(image).toHaveAttribute('src', LOGO_SRC_DARK);
    });

    it('renders with default size (120x120) when no dimensions provided', () => {
      render(
        <MantineProvider>
          <Logo />
        </MantineProvider>,
      );
      const image = screen.getByTestId('logo-image');
      expect(image).toHaveAttribute('width', '120');
      expect(image).toHaveAttribute('height', '120');
    });

    it('renders with custom width and height', () => {
      render(
        <MantineProvider>
          <Logo width={80} height={80} />
        </MantineProvider>,
      );
      const image = screen.getByTestId('logo-image');
      expect(image).toHaveAttribute('width', '80');
      expect(image).toHaveAttribute('height', '80');
    });

    it('renders icon variant with correct size (40x40)', () => {
      render(
        <MantineProvider>
          <Logo variant="icon" />
        </MantineProvider>,
      );
      const image = screen.getByAltText('Cookbook');
      expect(image).toHaveAttribute('width', '40');
      expect(image).toHaveAttribute('height', '40');
    });
  });

  describe('LogoIcon Component', () => {
    it('renders with correct alt text', () => {
      render(
        <MantineProvider>
          <LogoIcon />
        </MantineProvider>,
      );
      const image = screen.getByAltText('Cookbook');
      expect(image).toBeInTheDocument();
    });

    it('renders with icon variant size (40x40) by default', () => {
      render(
        <MantineProvider>
          <LogoIcon />
        </MantineProvider>,
      );
      const image = screen.getByTestId('logo-image');
      expect(image).toHaveAttribute('width', '40');
      expect(image).toHaveAttribute('height', '40');
    });

    it('allows custom dimensions to override default', () => {
      render(
        <MantineProvider>
          <LogoIcon width={32} height={32} />
        </MantineProvider>,
      );
      const image = screen.getByTestId('logo-image');
      expect(image).toHaveAttribute('width', '32');
      expect(image).toHaveAttribute('height', '32');
    });

    it('uses light logo in light mode', () => {
      mockComputedColorScheme.mockReturnValue('light');
      render(
        <MantineProvider>
          <LogoIcon />
        </MantineProvider>,
      );
      const image = screen.getByTestId('logo-image');
      expect(image).toHaveAttribute('src', LOGO_SRC_LIGHT);
    });

    it('uses dark logo in dark mode', () => {
      mockComputedColorScheme.mockReturnValue('dark');
      render(
        <MantineProvider>
          <LogoIcon />
        </MantineProvider>,
      );
      const image = screen.getByTestId('logo-image');
      expect(image).toHaveAttribute('src', LOGO_SRC_DARK);
    });
  });
});
