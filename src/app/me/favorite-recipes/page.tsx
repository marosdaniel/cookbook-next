import type { Metadata } from 'next';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getMetadata } from '@/lib/seo/seo';
import FavoriteRecipesClient from './FavoriteRecipesClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getMetadata(locale, 'seo', {
    titleKey: 'favoritesTitle',
    descriptionKey: 'favoritesDescription',
    fallbackTitle: 'Favorite Recipes',
    fallbackDescription: 'Your favorite recipes',
  });
}

const FavoriteRecipesPage = () => {
  return <FavoriteRecipesClient />;
};

export default FavoriteRecipesPage;
