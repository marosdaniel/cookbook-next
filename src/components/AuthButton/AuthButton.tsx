'use client';

import { ActionIcon, Button } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type FC, useTransition } from 'react';
import { FiLogIn } from 'react-icons/fi';
import { AUTH_ROUTES } from '@/types/routes';
import type { AuthButtonProps } from './types';

const AuthButton: FC<AuthButtonProps> = ({ variant = 'default' }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('auth');

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
          gradient={{ from: 'pink', to: 'grape', deg: 90 }}
          size="lg"
          onClick={handleClick}
          aria-label={t('login')}
          hiddenFrom="sm"
          loading={isPending}
        >
          <FiLogIn size={18} />
        </ActionIcon>

        {/* Full button on desktop */}
        <Button
          variant="gradient"
          gradient={{ from: 'pink', to: 'grape', deg: 90 }}
          size="sm"
          leftSection={<FiLogIn size={16} />}
          onClick={handleClick}
          visibleFrom="sm"
          loading={isPending}
          styles={{
            root: {
              fontWeight: 600,
            },
          }}
        >
          {t('login')}
        </Button>
      </>
    );
  }

  return (
    <Button
      variant="gradient"
      gradient={{ from: 'pink', to: 'grape', deg: 90 }}
      size="sm"
      leftSection={<FiLogIn size={16} />}
      onClick={handleClick}
      styles={{
        root: {
          fontWeight: 600,
        },
      }}
    >
      {t('login')}
    </Button>
  );
};

export default AuthButton;
