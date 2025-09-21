'use client';

import { useLocale } from '@/hooks/useLocale';
import { useFormatter } from 'next-intl';
import { Button, Title } from '@mantine/core';

export default function Home() {
  const { locale, changeLocale, t } = useLocale();
  const format = useFormatter();

  // Test advanced features
  const testDate = new Date();
  const testNumber = 1234.56;
  const itemCount: number = 5;

  return (
    <div style={{ padding: '2rem' }}>
      <Title order={1}>Next.js Cookbook123123</Title>

      <div style={{ marginBottom: '2rem' }}>
        <p>Current locale: {locale}</p>
        <Button
          onClick={() => changeLocale('en')}
          disabled={locale === 'en'}
          style={{ marginRight: '1rem' }}
        >
          English
        </Button>
        <Button onClick={() => changeLocale('hu')} disabled={locale === 'hu'}>
          Magyar
        </Button>
        <Button onClick={() => changeLocale('de')} disabled={locale === 'de'}>
          Deutsch
        </Button>
      </div>

      <div>
        <h2>Translations Test:</h2>
        <p>Edit: {t('general.edit')}</p>
        <p>Save: {t('general.save')}</p>
        <p>Cancel: {t('general.cancel')}</p>
        <p>Login: {t('auth.login')}</p>

        <h2>Advanced Features Test:</h2>
        <p>
          Date:{' '}
          {format.dateTime(testDate, { dateStyle: 'full', timeStyle: 'short' })}
        </p>
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
