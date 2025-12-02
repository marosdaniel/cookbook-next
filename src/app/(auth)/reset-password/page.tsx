import type { Metadata } from 'next';
import type { FC } from 'react';
import { getLocaleFromCookies } from '@/lib/locale';
import { getAuthMetadata } from '@/lib/seo';
import { ResetPasswordForm } from './ResetPasswordForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getAuthMetadata(locale, {
    titleKey: 'forgotPasswordTitle',
    descriptionKey: 'resetPasswordDescription',
    fallbackTitle: 'Forgot Password',
    fallbackDescription: 'Reset your password',
  });
}

const ResetPasswordPage: FC = () => {
  return <ResetPasswordForm />;
};

export default ResetPasswordPage;
