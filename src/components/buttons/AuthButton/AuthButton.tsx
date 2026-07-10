'use client';

import { ActionIcon, Button } from '@mantine/core';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type FC, useTransition } from 'react';
import { FiLogIn } from 'react-icons/fi';
import { AUTH_ROUTES } from '@/types/routes';
import classes from './AuthButton.module.css';
import type { AuthButtonProps } from './types';

const BUTTON_TRANSITION = {
  type: 'spring',
  stiffness: 420,
  damping: 24,
  mass: 0.65,
} as const;

const AuthButton: FC<AuthButtonProps> = ({ variant = 'default' }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const translate = useTranslations('auth');

  const handleClick = () => {
    if (isPending) {
      return;
    }

    startTransition(() => {
      router.push(AUTH_ROUTES.LOGIN);
    });
  };

  if (variant === 'compact') {
    return (
      <>
        {/* Icon only on mobile */}
        <motion.div
          whileHover={isPending ? undefined : { scale: 1.04 }}
          whileTap={isPending ? undefined : { scale: 0.96 }}
          transition={BUTTON_TRANSITION}
          style={{ display: 'contents' }}
        >
          <ActionIcon
            variant="gradient"
            gradient={{ from: 'pink', to: 'violet', deg: 45 }}
            size="lg"
            onClick={handleClick}
            aria-label={translate('login')}
            data-testid="auth-login"
            hiddenFrom="sm"
            loading={isPending}
          >
            <FiLogIn size={18} />
          </ActionIcon>
        </motion.div>

        {/* Full button on desktop */}
        <motion.div
          whileHover={isPending ? undefined : { scale: 1.02 }}
          whileTap={isPending ? undefined : { scale: 0.98 }}
          transition={BUTTON_TRANSITION}
          style={{ display: 'contents' }}
        >
          <Button
            variant="gradient"
            gradient={{ from: 'pink', to: 'violet', deg: 45 }}
            size="sm"
            leftSection={<FiLogIn size={16} />}
            onClick={handleClick}
            visibleFrom="sm"
            loading={isPending}
            className={classes.authButton}
            styles={{
              root: {
                fontWeight: 600,
              },
            }}
            data-testid="auth-login"
          >
            {translate('login')}
          </Button>
        </motion.div>
      </>
    );
  }

  return (
    <motion.div
      whileHover={isPending ? undefined : { scale: 1.02 }}
      whileTap={isPending ? undefined : { scale: 0.98 }}
      transition={BUTTON_TRANSITION}
      style={{ display: 'inline-block' }}
    >
      <Button
        variant="gradient"
        gradient={{ from: 'pink', to: 'violet', deg: 45 }}
        size="sm"
        leftSection={<FiLogIn size={16} />}
        onClick={handleClick}
        loading={isPending}
        className={classes.authButton}
        styles={{
          root: {
            fontWeight: 600,
          },
        }}
        data-testid="auth-login"
      >
        {translate('login')}
      </Button>
    </motion.div>
  );
};

export default AuthButton;
