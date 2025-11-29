import type { Metadata } from 'next';
import type { FC } from 'react';
import { getLocaleFromCookies } from '@/app/layout';
import { getLocaleMessages } from '@/lib/locale';
import SignUpForm from './SignUpForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  const messages = await getLocaleMessages(locale);

  const auth = messages.auth as Record<string, unknown> | undefined;
  const title =
    typeof auth?.createAccount === 'string'
      ? auth.createAccount
      : 'Create Account';
  const description =
    typeof auth?.signupDescription === 'string'
      ? auth.signupDescription
      : 'Create your account';

  return {
    title: `${title} | Cookbook`,
    description,
  };
}

const SignUpPage: FC = () => {
  return <SignUpForm />;
};

export default SignUpPage;
