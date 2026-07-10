'use client';

import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { type FC, useEffect, useState } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useAppDispatch } from '@/lib/store';
import { setDarkMode } from '@/lib/store/global';
import { useIsDarkMode } from '@/lib/store/global/selectors';

const ICON_SIZE = 20;

const ThemeSwitcher: FC = () => {
  const translate = useTranslations('common');
  const dispatch = useAppDispatch();
  const isDarkMode = useIsDarkMode();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        data-testid="theme-toggle"
      >
        <span
          aria-hidden="true"
          style={{ display: 'block', width: ICON_SIZE, height: ICON_SIZE }}
        />
      </ActionIcon>
    );
  }

  const iconKey = isDarkMode ? 'sun' : 'moon';

  return (
    <ActionIcon
      variant="subtle"
      color="gray"
      size="lg"
      onClick={handleToggleTheme}
      aria-label={translate('toggleTheme')}
      data-testid="theme-toggle"
      title={isDarkMode ? translate('lightMode') : translate('darkMode')}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={iconKey}
          initial={{ opacity: 0, scale: 0.7, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.7, rotate: 45 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: ICON_SIZE,
            height: ICON_SIZE,
          }}
        >
          {isDarkMode ? (
            <FiSun size={ICON_SIZE} />
          ) : (
            <FiMoon size={ICON_SIZE} />
          )}
        </motion.span>
      </AnimatePresence>
    </ActionIcon>
  );
};

export default ThemeSwitcher;
