import type { Metadata } from 'next';
import type { FC } from 'react';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getAuthMetadata } from '@/lib/seo/seo';
import { SetNewPasswordForm } from './SetNewPasswordForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getAuthMetadata(locale, {
    titleKey: 'setNewPasswordTitle',
    descriptionKey: 'setNewPasswordDescription',
    fallbackTitle: 'Set New Password',
    fallbackDescription: 'Enter your new password',
  });
}

const SetNewPasswordPage: FC = () => {
  return <SetNewPasswordForm />;
};

export default SetNewPasswordPage;
