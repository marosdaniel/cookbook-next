import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { FC } from 'react';
import SignUpForm from './SignUpForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');

  return {
    title: `${t('createAccount')} | Cookbook`,
    description: t('signupDescription'),
  };
}

const SignUpPage: FC = () => {
  return <SignUpForm />;
};

export default SignUpPage;
