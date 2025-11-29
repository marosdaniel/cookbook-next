'use client';

import { ActionIcon, Menu, useMantineTheme } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { type FC, useTransition } from 'react';
import { FiCheck, FiGlobe } from 'react-icons/fi';
import { setStoredLocale } from '@/lib/locale';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'hu', label: 'Magyar', flag: '🇭🇺' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const LanguageSelector: FC = () => {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const theme = useMantineTheme();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) return;

    setStoredLocale(newLocale);
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          loading={isPending}
          aria-label={t('languageSelector')}
        >
          <FiGlobe size={20} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t('language')}</Menu.Label>
        {LANGUAGES.map((lang) => (
          <Menu.Item
            key={lang.code}
            leftSection={<span style={{ fontSize: 18 }}>{lang.flag}</span>}
            rightSection={
              lang.code === locale ? (
                <FiCheck size={16} color={theme.colors.blue[6]} />
              ) : null
            }
            onClick={() => handleLanguageChange(lang.code)}
          >
            {lang.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

export default LanguageSelector;
