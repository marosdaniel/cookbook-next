'use client';

import { Button, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { setStoredLocale } from '@/lib/locale/locale.client';

export default function Home() {
  const router = useRouter();
  const locale = useLocale();
  const format = useFormatter();
  const translate = useTranslations();
  const [isPending, startTransition] = useTransition();

  const testNumber = 1234.56;
  const itemCount: number = 5;

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === locale) return;
    setStoredLocale(newLocale);
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <Title order={1}>Next.js Cookbook123123</Title>

      <div style={{ marginBottom: '2rem' }}>
        <p>Current locale: {locale}</p>
        <Button
          onClick={() => handleLocaleChange('en')}
          disabled={locale === 'en' || isPending}
          loading={isPending && locale !== 'en'}
          style={{ marginRight: '1rem' }}
        >
          English
        </Button>
        <Button
          onClick={() => handleLocaleChange('hu')}
          disabled={locale === 'hu' || isPending}
          loading={isPending && locale !== 'hu'}
          style={{ marginRight: '1rem' }}
        >
          Magyar
        </Button>
        <Button
          onClick={() => handleLocaleChange('de')}
          disabled={locale === 'de' || isPending}
          loading={isPending && locale !== 'de'}
        >
          Deutsch
        </Button>
      </div>

      <div>
        <h2>Translations Test:</h2>
        <p>Edit: {translate('general.edit')}</p>
        <p>Save: {translate('general.save')}</p>
        <p>Cancel: {translate('general.cancel')}</p>
        <p>Login: {translate('auth.login')}</p>

        <h2>Advanced Features Test:</h2>
        <p>
          Number:{' '}
          {format.number(testNumber, { style: 'currency', currency: 'EUR' })}
        </p>
        <p>
          Items: {format.number(itemCount)} {itemCount === 1 ? 'item' : 'items'}
        </p>
      </div>
    </div>
  );
}
