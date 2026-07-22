export interface MediaSectionProps {
  onBack: () => void;
  onNext: () => void;
}

export type MediaTextField =
  | 'imgSrc'
  | 'youtubeLink'
  | 'slug'
  | 'seoTitle'
  | 'seoDescription'
  | 'socialImage';
