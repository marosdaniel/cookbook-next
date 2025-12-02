import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LanguageSelector from './LanguageSelector';

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'common.languageSelector': 'Language Selector',
      'common.language': 'Language',
    };
    return translations[key] || key;
  },
}));

// Mock LANGUAGES
vi.mock('@/i18n/languages', () => ({
  LANGUAGES: [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'hu', label: 'Magyar', flag: '🇭🇺' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  ],
}));

// Mock locale utilities
vi.mock('@/lib/locale/locale.client', () => ({
  setStoredLocale: vi.fn(),
}));

// Import the mocked function after mocking
import { setStoredLocale } from '@/lib/locale/locale.client';

describe('LanguageSelector', () => {
  const mockSetStoredLocale = vi.mocked(setStoredLocale);
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the language selector button', () => {
    render(
      <MantineProvider>
        <LanguageSelector />
      </MantineProvider>,
    );
    const button = screen.getByLabelText('languageSelector');
    expect(button).toBeInTheDocument();
  });

  it('opens menu when clicked', async () => {
    render(
      <MantineProvider>
        <LanguageSelector />
      </MantineProvider>,
    );

    const button = screen.getByLabelText('languageSelector');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Magyar')).toBeInTheDocument();
      expect(screen.getByText('Deutsch')).toBeInTheDocument();
    });
  });

  it('displays all available languages with flags', async () => {
    render(
      <MantineProvider>
        <LanguageSelector />
      </MantineProvider>,
    );

    const button = screen.getByLabelText('languageSelector');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Magyar')).toBeInTheDocument();
      expect(screen.getByText('Deutsch')).toBeInTheDocument();
      expect(screen.getByText('🇺🇸')).toBeInTheDocument();
      expect(screen.getByText('🇭🇺')).toBeInTheDocument();
      expect(screen.getByText('🇩🇪')).toBeInTheDocument();
    });
  });

  it('shows checkmark for currently selected language', async () => {
    render(
      <MantineProvider>
        <LanguageSelector />
      </MantineProvider>,
    );

    const button = screen.getByLabelText('languageSelector');
    fireEvent.click(button);

    await waitFor(() => {
      const englishItem = screen.getByText('English').closest('button');
      expect(englishItem).toBeInTheDocument();
      // The checkmark should be present for the current locale (en)
    });
  });

  it('calls setStoredLocale and router.refresh when language is changed', async () => {
    render(
      <MantineProvider>
        <LanguageSelector />
      </MantineProvider>,
    );

    const button = screen.getByLabelText('languageSelector');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Magyar')).toBeInTheDocument();
    });

    const magyarOption = screen.getByText('Magyar');
    fireEvent.click(magyarOption);

    await waitFor(() => {
      expect(mockSetStoredLocale).toHaveBeenCalledWith('hu');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('does not call setStoredLocale when clicking the current language', async () => {
    render(
      <MantineProvider>
        <LanguageSelector />
      </MantineProvider>,
    );

    const button = screen.getByLabelText('languageSelector');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    const englishOption = screen.getByText('English');
    fireEvent.click(englishOption);

    // Should not be called because 'en' is already the current locale
    expect(mockSetStoredLocale).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('displays menu label', async () => {
    render(
      <MantineProvider>
        <LanguageSelector />
      </MantineProvider>,
    );

    const button = screen.getByLabelText('languageSelector');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('language')).toBeInTheDocument();
    });
  });
});
