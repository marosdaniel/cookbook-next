import type { Metadata } from 'next';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getMetadata } from '@/lib/seo/seo';
import RecipeCreateClient from './RecipeCreateClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getMetadata(locale, 'seo', {
    titleKey: 'createRecipeTitle',
    descriptionKey: 'createRecipeDescription',
    fallbackTitle: 'Create Recipe',
    fallbackDescription: 'Share your recipes',
  });
}

export default function NewRecipePage() {
  return <RecipeCreateClient />;
}
