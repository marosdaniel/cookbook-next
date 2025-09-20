'use client';

import { useLocale } from '@/hooks/useLocale';
import { Button, Title } from '@mantine/core';

export default function Home() {
  const { locale, changeLocale, t } = useLocale();

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
      </div>

      <div>
        <h2>Translations Test:</h2>
        <p>Edit: {t('general.edit')}</p>
        <p>Save: {t('general.save')}</p>
        <p>Cancel: {t('general.cancel')}</p>
        <p>Login: {t('auth.login')}</p>
      </div>
    </div>
  );
}
