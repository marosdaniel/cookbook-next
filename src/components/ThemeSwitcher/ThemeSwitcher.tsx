'use client';

import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { type FC, useEffect, useState } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useAppDispatch } from '@/lib/store';
import { setDarkMode } from '@/lib/store/global';
import { useIsDarkMode } from '@/lib/store/global/selectors';

const ThemeSwitcher: FC = () => {
  const translate = useTranslations('common');
  const dispatch = useAppDispatch();
  const isDarkMode = useIsDarkMode();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync Mantine color scheme with Redux state on mount and when isDarkMode changes
  useEffect(() => {
    const targetScheme = isDarkMode ? 'dark' : 'light';
    if (colorScheme !== targetScheme) {
      setColorScheme(targetScheme);
    }
  }, [isDarkMode, setColorScheme, colorScheme]);

  const handleToggleTheme = () => {
    const newDarkMode = !isDarkMode;
    dispatch(setDarkMode(newDarkMode));
    setColorScheme(newDarkMode ? 'dark' : 'light');
  };

  if (!mounted) {
    return (
      <ActionIcon
        variant="subtle"
        color="gray"
        size="lg"
        aria-label={translate('toggleTheme')}
      >
        <div style={{ width: 20, height: 20 }} />
      </ActionIcon>
    );
  }

  return (
    <ActionIcon
      variant="subtle"
      color="gray"
      size="lg"
      onClick={handleToggleTheme}
      aria-label={translate('toggleTheme')}
      title={isDarkMode ? translate('lightMode') : translate('darkMode')}
    >
      {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
    </ActionIcon>
  );
};

export default ThemeSwitcher;
