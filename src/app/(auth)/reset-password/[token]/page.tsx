import type { Metadata } from 'next';
import type { FC } from 'react';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getMetadata } from '@/lib/seo/seo';
import { SetNewPasswordForm } from './SetNewPasswordForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getMetadata(locale, 'seo', {
    titleKey: 'resetPasswordTitle',
    descriptionKey: 'resetPasswordDescription',
    fallbackTitle: 'Set New Password',
    fallbackDescription: 'Enter your new password',
  });
}

const SetNewPasswordPage: FC = () => {
  return <SetNewPasswordForm />;
};

export default SetNewPasswordPage;
