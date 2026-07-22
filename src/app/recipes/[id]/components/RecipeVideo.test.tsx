import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import { RecipeVideo } from './RecipeVideo';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      videoTitle: 'Video',
    };

    return translations[key] || key;
  },
}));

describe('RecipeVideo', () => {
  it('renders the video section with the expected title and iframe source', () => {
    render(<RecipeVideo youtubeId="abc123" title="Intro" />);

    expect(screen.getByTestId('recipe-video')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-video-title')).toHaveTextContent('Video');
    expect(screen.getByTestId('recipe-video-wrapper')).toBeInTheDocument();
  });
});
