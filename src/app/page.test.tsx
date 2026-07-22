import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';

const { mockGetLocaleFromCookies, mockGetMetadata } = vi.hoisted(() => ({
  mockGetLocaleFromCookies: vi.fn(),
  mockGetMetadata: vi.fn(),
}));

vi.mock('@/lib/locale/locale.server', () => ({
  getLocaleFromCookies: mockGetLocaleFromCookies,
}));

vi.mock('@/lib/seo/seo', () => ({
  getMetadata: mockGetMetadata,
}));

vi.mock('./HomePage', () => ({
  default: () => <div data-testid="home-page-rendered">home page</div>,
}));

import HomePageRoute, { generateMetadata } from './page';

describe('Home page route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the home page component', () => {
    render(<HomePageRoute />);
    expect(screen.getByTestId('home-page-rendered')).toHaveTextContent(
      'home page',
    );
  });

  it('builds metadata using the locale and seo fallback values', async () => {
    mockGetLocaleFromCookies.mockResolvedValue('hu');
    mockGetMetadata.mockResolvedValue({ title: 'Home' });

    await generateMetadata();

    expect(mockGetLocaleFromCookies).toHaveBeenCalled();
    expect(mockGetMetadata).toHaveBeenCalledWith(
      'hu',
      'seo',
      expect.objectContaining({
        titleKey: 'homeTitle',
        descriptionKey: 'homeDescription',
        fallbackTitle: 'Home',
        fallbackDescription: 'Discover and share recipes',
        keywordsKey: 'homeKeywords',
        fallbackKeywords: 'recipes, cooking, food, meals, cookbook',
      }),
    );
  });
});
