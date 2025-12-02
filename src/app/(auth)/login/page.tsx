import type { Metadata } from 'next';
import type { FC } from 'react';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getAuthMetadata } from '@/lib/seo';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getAuthMetadata(locale, {
    titleKey: 'login',
    descriptionKey: 'loginDescription',
    fallbackTitle: 'Login',
    fallbackDescription: 'Sign in to your account',
  });
}

const LoginPage: FC = () => {
  return <LoginForm />;
};

export default LoginPage;
