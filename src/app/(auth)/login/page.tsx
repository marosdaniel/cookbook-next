import type { Metadata } from 'next';
import type { FC } from 'react';
import { getLocaleFromCookies } from '@/app/layout';
import { getLocaleMessages } from '@/lib/locale';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  const messages = await getLocaleMessages(locale);

  const auth = messages.auth as Record<string, unknown> | undefined;
  const title = typeof auth?.login === 'string' ? auth.login : 'Login';
  const description =
    typeof auth?.loginDescription === 'string'
      ? auth.loginDescription
      : 'Sign in to your account';

  return {
    title: `${title} | Cookbook`,
    description,
  };
}

const LoginPage: FC = () => {
  return <LoginForm />;
};

export default LoginPage;
