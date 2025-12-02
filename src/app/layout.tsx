import type { Metadata } from 'next';
import nextDynamic from 'next/dynamic';
import { connection } from 'next/server';
import { getLocaleFromCookies, getLocaleMessages } from '@/lib/locale';
import { ServerProviders } from '@/providers/server';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';
import type { PropsWithChildren } from 'react';
import Shell from '../components/Shell';

const ClientProviders = nextDynamic(
  () => import('@/providers/client').then((m) => m.ClientProviders),
  {
    ssr: true,
  },
);

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const locale = await getLocaleFromCookies();
  const messages = await getLocaleMessages(locale);

  const seo = messages.seo as Record<string, unknown> | undefined;
  const appTitle =
    typeof seo?.appTitle === 'string' ? seo.appTitle : 'Cookbook';
  const appDescription =
    typeof seo?.appDescription === 'string'
      ? seo.appDescription
      : 'Share your recipes';

  return {
    title: appTitle,
    description: appDescription,
  };
}

export default async function RootLayout(props: Readonly<PropsWithChildren>) {
  await connection();
  const locale = await getLocaleFromCookies();

  // Load all language messages for SSR
  const [enMessages, huMessages, deMessages] = await Promise.all([
    getLocaleMessages('en'),
    getLocaleMessages('hu'),
    getLocaleMessages('de'),
  ]);

  const allMessages = {
    en: enMessages,
    hu: huMessages,
    de: deMessages,
  };

  return (
    <html lang={locale}>
      <body suppressHydrationWarning>
        <ServerProviders>
          <ClientProviders messages={allMessages} locale={locale}>
            <Shell>{props.children}</Shell>
          </ClientProviders>
        </ServerProviders>
      </body>
    </html>
  );
}
