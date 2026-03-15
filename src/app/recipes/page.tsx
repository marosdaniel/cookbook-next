import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getMetadata } from '@/lib/seo/seo';
import RecipesPage from './RecipesPage';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getMetadata(locale, 'seo', {
    titleKey: 'allRecipes',
    descriptionKey: 'recipesDescription',
    fallbackTitle: 'Recipes',
    fallbackDescription: 'Browse all recipes',
  });
}

const Recipes = () => {
  return (
    <Suspense>
      <RecipesPage />
    </Suspense>
  );
};

export default Recipes;
