import type { Metadata } from 'next';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getMetadata } from '@/lib/seo/seo';
import RecipeEditClient from './RecipeEditClient';

interface EditRecipePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getMetadata(locale, 'seo', {
    titleKey: 'editRecipeTitle',
    descriptionKey: 'editRecipeDescription',
    fallbackTitle: 'Edit Recipe',
    fallbackDescription: 'Edit your recipe',
  });
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = await params;
  return <RecipeEditClient recipeId={id} />;
}
