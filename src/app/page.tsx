import type { Metadata } from 'next';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getMetadata } from '@/lib/seo/seo';
import HomePage from './HomePage';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getMetadata(locale, 'seo', {
    titleKey: 'homeTitle',
    descriptionKey: 'homeDescription',
    fallbackTitle: 'Home',
    fallbackDescription: 'Discover and share recipes',
  });
}

export default function Home() {
  return <HomePage />;
}
