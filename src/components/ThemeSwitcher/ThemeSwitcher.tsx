'use client';

import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { type FC, useEffect } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useAppDispatch } from '@/lib/store';
import { setDarkMode } from '@/lib/store/global';
import { useIsDarkMode } from '@/lib/store/global/selectors';

const ThemeSwitcher: FC = () => {
  const t = useTranslations('common');
  const dispatch = useAppDispatch();
  const isDarkMode = useIsDarkMode();
  const { setColorScheme } = useMantineColorScheme();

  // Sync Mantine color scheme with Redux state on mount and when isDarkMode changes
  useEffect(() => {
    setColorScheme(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode, setColorScheme]);

  const handleToggleTheme = () => {
    const newDarkMode = !isDarkMode;
    dispatch(setDarkMode(newDarkMode));
    setColorScheme(newDarkMode ? 'dark' : 'light');
  };

  return (
    <ActionIcon
      variant="subtle"
      color="gray"
      size="lg"
      onClick={handleToggleTheme}
      aria-label={t('toggleTheme')}
      title={isDarkMode ? t('lightMode') : t('darkMode')}
    >
      {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
    </ActionIcon>
  );
};

export default ThemeSwitcher;
