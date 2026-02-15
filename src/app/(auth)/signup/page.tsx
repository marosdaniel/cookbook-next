import type { Metadata } from 'next';
import type { FC } from 'react';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getMetadata } from '@/lib/seo/seo';
import SignUpForm from './SignUpForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getMetadata(locale, 'seo', {
    titleKey: 'signupTitle',
    descriptionKey: 'signupDescription',
    fallbackTitle: 'Register',
    fallbackDescription: 'Create your account',
  });
}

const SignUpPage: FC = () => {
  return <SignUpForm />;
};

export default SignUpPage;
