'use client';

import { ActionIcon, Button } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type FC, useTransition } from 'react';
import { FiLogIn } from 'react-icons/fi';
import { AUTH_ROUTES } from '@/types/routes';
import classes from './AuthButton.module.css';
import type { AuthButtonProps } from './types';

const AuthButton: FC<AuthButtonProps> = ({ variant = 'default' }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const translate = useTranslations('auth');

  const handleClick = () => {
    startTransition(() => {
      router.push(AUTH_ROUTES.LOGIN);
    });
  };

  if (variant === 'compact') {
    return (
      <>
        {/* Icon only on mobile */}
        <ActionIcon
          variant="gradient"
          gradient={{ from: 'pink', to: 'violet', deg: 45 }}
          size="lg"
          onClick={handleClick}
          aria-label={translate('login')}
          hiddenFrom="sm"
          loading={isPending}
        >
          <FiLogIn size={18} />
        </ActionIcon>

        {/* Full button on desktop */}
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
        >
          {translate('login')}
        </Button>
      </>
    );
  }

  return (
    <Button
      variant="gradient"
      gradient={{ from: 'pink', to: 'violet', deg: 45 }}
      size="sm"
      leftSection={<FiLogIn size={16} />}
      onClick={handleClick}
      className={classes.authButton}
      styles={{
        root: {
          fontWeight: 600,
        },
      }}
    >
      {translate('login')}
    </Button>
  );
};

export default AuthButton;
