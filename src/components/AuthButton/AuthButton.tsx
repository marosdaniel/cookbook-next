'use client';

import { ActionIcon, Button } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { FC } from 'react';
import { FiLogIn } from 'react-icons/fi';
import { AUTH_ROUTES } from '@/types/routes';

interface AuthButtonProps {
  variant?: 'default' | 'compact';
}

const AuthButton: FC<AuthButtonProps> = ({ variant = 'default' }) => {
  const router = useRouter();
  const t = useTranslations('auth');

  const handleClick = () => {
    router.push(AUTH_ROUTES.LOGIN);
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
