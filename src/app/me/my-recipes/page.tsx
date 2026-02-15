import type { Metadata } from 'next';
import UnderConstruction from '@/components/UnderConstruction';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getMetadata } from '@/lib/seo/seo';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getMetadata(locale, 'seo', {
    titleKey: 'myRecipesTitle',
    descriptionKey: 'myRecipesDescription',
    fallbackTitle: 'My Recipes',
    fallbackDescription: 'Your created recipes',
  });
}

export default function MyRecipesPage() {
  return <UnderConstruction />;
}
