import type { Metadata } from 'next';
import nextDynamic from 'next/dynamic';
import { connection } from 'next/server';
import { getLocaleMessages } from '@/lib/locale/locale';
import { ServerProviders } from '@/providers/server';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';
import type { PropsWithChildren } from 'react';
import Shell from '@/components/Shell';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';

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

  const seo = messages.seo as Record<string, string> | undefined;
  const appTitle =
    typeof seo?.appTitle === 'string' ? seo.appTitle : 'Cookbook';
  const appDescription =
    typeof seo?.appDescription === 'string'
      ? seo.appDescription
      : 'Share your recipes';

  return {
    title: appTitle,
    description: appDescription,
    manifest: '/site.webmanifest',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      shortcut: [{ url: '/favicon.ico' }],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: appTitle,
    },
    openGraph: {
      title: appTitle,
      description: appDescription,
      type: 'website',
      siteName: appTitle,
    },
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#FF00A1' },
      { media: '(prefers-color-scheme: dark)', color: '#FF00A1' },
    ],
  };
}

export default async function RootLayout(props: Readonly<PropsWithChildren>) {
  await connection();
  const locale = await getLocaleFromCookies();

  // Load all language messages for SSR
  const [enMessages, huMessages, deMessages] = await Promise.all([
    getLocaleMessages('en-gb'),
    getLocaleMessages('hu'),
    getLocaleMessages('de'),
  ]);

  const allMessages = {
    'en-gb': enMessages,
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
