import type { Metadata } from 'next';
import type { FC } from 'react';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getMetadata } from '@/lib/seo/seo';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getMetadata(locale, 'seo', {
    titleKey: 'loginTitle',
    descriptionKey: 'loginDescription',
    fallbackTitle: 'Login',
    fallbackDescription: 'Sign in to your account',
  });
}

const LoginPage: FC = () => {
  return <LoginForm />;
};

export default LoginPage;
