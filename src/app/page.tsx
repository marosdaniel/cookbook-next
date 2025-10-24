'use client';

import { Button, Title } from '@mantine/core';
import { useFormatter, useTranslations } from 'next-intl';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/lib/store';
import { setLocale } from '@/lib/store';

export default function Home() {
  const dispatch = useDispatch();
  const locale = useSelector((state: RootState) => state.global.locale);
  const format = useFormatter();
  const t = useTranslations();

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
          onClick={() => dispatch(setLocale('en'))}
          disabled={locale === 'en'}
          style={{ marginRight: '1rem' }}
        >
          English
        </Button>
        <Button
          onClick={() => dispatch(setLocale('hu'))}
          disabled={locale === 'hu'}
        >
          Magyar
        </Button>
        <Button
          onClick={() => dispatch(setLocale('de'))}
          disabled={locale === 'de'}
        >
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
