import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { getSessionSafely } from '@/lib/auth/safeSession';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getMetadata } from '@/lib/seo/seo';
import { ADMIN_ROUTES, AUTH_ROUTES, PUBLIC_ROUTES } from '@/types/routes';
import AdminShell from './AdminShell';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();

  return getMetadata(locale, 'seo', {
    titleKey: 'adminTitle',
    descriptionKey: 'adminDescription',
    fallbackTitle: 'Admin',
    fallbackDescription: 'Administration',
    robots: { index: false, follow: false },
  });
}

// Authoritative guard: the proxy only rejects early, so the role is checked again here.
// getSessionSafely() never throws, so a revoked session redirects to login.
const AdminLayout = async ({ children }: Readonly<PropsWithChildren>) => {
  const session = await getSessionSafely();

  if (!session?.user) {
    redirect(
      `${AUTH_ROUTES.LOGIN}?callbackUrl=${encodeURIComponent(ADMIN_ROUTES.DASHBOARD)}`,
    );
  }

  if (session.user.role !== 'ADMIN') {
    redirect(PUBLIC_ROUTES.HOME);
  }

  return <AdminShell>{children}</AdminShell>;
};

export default AdminLayout;
