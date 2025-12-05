import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ThemeSwitcher from './ThemeSwitcher';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      toggleTheme: 'Toggle theme',
      lightMode: 'Light mode',
      darkMode: 'Dark mode',
    };
    return translations[key] || key;
  },
}));

// Mock Redux hooks
const mockDispatch = vi.fn();
const mockIsDarkMode = vi.fn();

vi.mock('@/lib/store', () => ({
  useAppDispatch: () => mockDispatch,
}));

vi.mock('@/lib/store/global/selectors', () => ({
  useIsDarkMode: () => mockIsDarkMode(),
}));

vi.mock('@/lib/store/global', () => ({
  setDarkMode: (value: boolean) => ({
    type: 'global/setDarkMode',
    payload: value,
  }),
}));

// Mock Mantine color scheme
const mockSetColorScheme = vi.fn();
const mockColorScheme = { current: 'light' as 'light' | 'dark' };

vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual('@mantine/core');
  return {
    ...actual,
    useMantineColorScheme: () => ({
      setColorScheme: mockSetColorScheme,
      colorScheme: mockColorScheme.current,
    }),
  };
});

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockColorScheme.current = 'light';
  });

  describe('Rendering', () => {
    it('renders the theme switcher button', () => {
      mockIsDarkMode.mockReturnValue(false);

      render(
        <MantineProvider>
          <ThemeSwitcher />
        </MantineProvider>,
      );

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toBeInTheDocument();
    });

    it('shows moon icon when in light mode', () => {
      mockIsDarkMode.mockReturnValue(false);

      const { container } = render(
        <MantineProvider>
          <ThemeSwitcher />
        </MantineProvider>,
      );

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toHaveAttribute('title', 'Dark mode');

      // Check that the moon icon is rendered (FiMoon)
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('shows sun icon when in dark mode', () => {
      mockIsDarkMode.mockReturnValue(true);

      const { container } = render(
        <MantineProvider>
          <ThemeSwitcher />
        </MantineProvider>,
      );

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toHaveAttribute('title', 'Light mode');

      // Check that the sun icon is rendered (FiSun)
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Theme Toggle', () => {
    it('dispatches setDarkMode action when clicked in light mode', () => {
      mockIsDarkMode.mockReturnValue(false);

      render(
        <MantineProvider>
          <ThemeSwitcher />
        </MantineProvider>,
      );

      const button = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(button);

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'global/setDarkMode',
        payload: true,
      });
    });

    it('dispatches setDarkMode action when clicked in dark mode', () => {
      mockIsDarkMode.mockReturnValue(true);

      render(
        <MantineProvider>
          <ThemeSwitcher />
        </MantineProvider>,
      );

      const button = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(button);

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'global/setDarkMode',
        payload: false,
      });
    });

    it('calls setColorScheme with correct value when toggling to dark mode', () => {
      mockIsDarkMode.mockReturnValue(false);

      render(
        <MantineProvider>
          <ThemeSwitcher />
        </MantineProvider>,
      );

      const button = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(button);

      expect(mockSetColorScheme).toHaveBeenCalledWith('dark');
    });

    it('calls setColorScheme with correct value when toggling to light mode', () => {
      mockIsDarkMode.mockReturnValue(true);

      render(
        <MantineProvider>
          <ThemeSwitcher />
        </MantineProvider>,
      );

      const button = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(button);

      expect(mockSetColorScheme).toHaveBeenCalledWith('light');
    });
  });

  describe('Accessibility', () => {
    it('has correct aria-label', () => {
      mockIsDarkMode.mockReturnValue(false);

      render(
        <MantineProvider>
          <ThemeSwitcher />
        </MantineProvider>,
      );

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toHaveAttribute('aria-label', 'Toggle theme');
    });

    it('has correct title attribute in light mode', () => {
      mockIsDarkMode.mockReturnValue(false);

      render(
        <MantineProvider>
          <ThemeSwitcher />
        </MantineProvider>,
      );

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toHaveAttribute('title', 'Dark mode');
    });

    it('has correct title attribute in dark mode', () => {
      mockIsDarkMode.mockReturnValue(true);

      render(
        <MantineProvider>
          <ThemeSwitcher />
        </MantineProvider>,
      );

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toHaveAttribute('title', 'Light mode');
    });
  });

  describe('Color Scheme Sync', () => {
    it('syncs color scheme on mount when in light mode', () => {
      mockIsDarkMode.mockReturnValue(false);
      mockColorScheme.current = 'dark'; // Simulate mismatch to trigger sync

      render(
        <MantineProvider>
          <ThemeSwitcher />
        </MantineProvider>,
      );

      expect(mockSetColorScheme).toHaveBeenCalledWith('light');
    });

    it('syncs color scheme on mount when in dark mode', () => {
      mockIsDarkMode.mockReturnValue(true);
      mockColorScheme.current = 'light'; // Simulate mismatch to trigger sync

      render(
        <MantineProvider>
          <ThemeSwitcher />
        </MantineProvider>,
      );

      expect(mockSetColorScheme).toHaveBeenCalledWith('dark');
    });

    it('does not sync color scheme when already in correct mode', () => {
      mockIsDarkMode.mockReturnValue(false);
      mockColorScheme.current = 'light'; // Already in sync

      render(
        <MantineProvider>
          <ThemeSwitcher />
        </MantineProvider>,
      );

      expect(mockSetColorScheme).not.toHaveBeenCalled();
    });
  });
});
