import type { Metadata } from 'next';
import UnderConstruction from '@/components/UnderConstruction';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getMetadata } from '@/lib/seo/seo';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getMetadata(locale, 'seo', {
    titleKey: 'favoritesTitle',
    descriptionKey: 'favoritesDescription',
    fallbackTitle: 'Favorite Recipes',
    fallbackDescription: 'Your favorite recipes',
  });
}

export default function FavoriteRecipesPage() {
  return <UnderConstruction />;
}
