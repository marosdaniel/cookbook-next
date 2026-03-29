import type { Metadata } from 'next';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getMetadata } from '@/lib/seo/seo';
import MyRecipesClient from './MyRecipesClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getMetadata(locale, 'seo', {
    titleKey: 'myRecipesTitle',
    descriptionKey: 'myRecipesDescription',
    fallbackTitle: 'My Recipes',
    fallbackDescription: 'Your created recipes',
  });
}

const MyRecipesPage = () => {
  return <MyRecipesClient />;
};

export default MyRecipesPage;
