import type { Metadata } from 'next';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getMetadata } from '@/lib/seo/seo';
import ProfileClient from './ProfileClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getMetadata(locale, 'seo', {
    titleKey: 'profileTitle',
    descriptionKey: 'profileDescription',
    fallbackTitle: 'Profile',
    fallbackDescription: 'Manage your profile',
  });
}

export default function ProfilePage() {
  return <ProfileClient />;
}
