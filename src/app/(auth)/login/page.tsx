import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { FC } from 'react';
import { LoginForm } from './LoginForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');

  return {
    title: `${t('login')} | Cookbook`,
    description: t('loginDescription'),
  };
}

const LoginPage: FC = () => {
  return <LoginForm />;
};

export default LoginPage;
