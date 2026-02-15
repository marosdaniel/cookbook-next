import type { Metadata } from 'next';
import type { FC } from 'react';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getMetadata } from '@/lib/seo/seo';
import { ResetPasswordForm } from './ResetPasswordForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getMetadata(locale, 'seo', {
    titleKey: 'forgotPasswordTitle',
    descriptionKey: 'forgotPasswordDescription',
    fallbackTitle: 'Forgot Password',
    fallbackDescription: 'Reset your password',
  });
}

const ResetPasswordPage: FC = () => {
  return <ResetPasswordForm />;
};

export default ResetPasswordPage;
