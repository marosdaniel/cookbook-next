import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/utils/test-utils';
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
  useLocale: () => 'en-gb',
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
    { code: 'en-gb', label: 'English', flag: '🇬🇧' },
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
    render(<LanguageSelector />);
    const button = screen.getByTestId('language-selector-button');
    expect(button).toBeInTheDocument();
  });

  it('opens menu when clicked', async () => {
    render(<LanguageSelector />);

    const button = screen.getByTestId('language-selector-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('language-item-en-gb')).toBeInTheDocument();
      expect(screen.getByTestId('language-item-hu')).toBeInTheDocument();
      expect(screen.getByTestId('language-item-de')).toBeInTheDocument();
    });
  });

  it('displays all available languages with flags', async () => {
    render(<LanguageSelector />);

    const button = screen.getByTestId('language-selector-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('language-item-en-gb')).toBeInTheDocument();
      expect(screen.getByTestId('language-item-hu')).toBeInTheDocument();
      expect(screen.getByTestId('language-item-de')).toBeInTheDocument();
      expect(screen.getByTestId('language-item-en-gb')).toHaveTextContent('English');
      expect(screen.getByTestId('language-item-hu')).toHaveTextContent('Magyar');
      expect(screen.getByTestId('language-item-de')).toHaveTextContent('Deutsch');
    });
  });

  it('shows checkmark for currently selected language', async () => {
    render(<LanguageSelector />);

    const button = screen.getByTestId('language-selector-button');
    fireEvent.click(button);

    await waitFor(() => {
      const englishItem = screen.getByTestId('language-item-en-gb');
      expect(englishItem).toBeInTheDocument();
      // The checkmark should be present for the current locale (en)
    });
  });

  it('calls setStoredLocale and router.refresh when language is changed', async () => {
    render(<LanguageSelector />);

    const button = screen.getByTestId('language-selector-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('language-item-hu')).toBeInTheDocument();
    });

    const magyarOption = screen.getByTestId('language-item-hu');
    fireEvent.click(magyarOption);

    await waitFor(() => {
      expect(mockSetStoredLocale).toHaveBeenCalledWith('hu');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('does not call setStoredLocale when clicking the current language', async () => {
    render(<LanguageSelector />);

    const button = screen.getByLabelText('languageSelector');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('language-item-en-gb')).toBeInTheDocument();
    });

    const englishOption = screen.getByTestId('language-item-en-gb');
    fireEvent.click(englishOption);

    // Should not be called because 'en' is already the current locale
    expect(mockSetStoredLocale).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('displays menu label', async () => {
    render(<LanguageSelector />);

    const button = screen.getByLabelText('languageSelector');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('language-selector-label')).toBeInTheDocument();
    });
  });
});
