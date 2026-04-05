import type { Metadata } from 'next';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getMetadata } from '@/lib/seo/seo';
import FollowingClient from './FollowingClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getMetadata(locale, 'seo', {
    titleKey: 'followingTitle',
    descriptionKey: 'followingDescription',
    fallbackTitle: 'Following',
    fallbackDescription: 'People you follow',
    robots: { index: false, follow: false },
  });
}

const FollowingsPage = () => {
  return <FollowingClient />;
};

export default FollowingsPage;
