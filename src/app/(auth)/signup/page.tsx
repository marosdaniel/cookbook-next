import type { Metadata } from 'next';
import type { FC } from 'react';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getAuthMetadata } from '@/lib/seo';
import SignUpForm from './SignUpForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getAuthMetadata(locale, {
    titleKey: 'createAccount',
    descriptionKey: 'signupDescription',
    fallbackTitle: 'Create Account',
    fallbackDescription: 'Create your account',
  });
}

const SignUpPage: FC = () => {
  return <SignUpForm />;
};

export default SignUpPage;
