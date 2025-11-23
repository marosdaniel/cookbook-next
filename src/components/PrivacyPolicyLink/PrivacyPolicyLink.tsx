'use client';

import { Anchor } from '@mantine/core';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { FC } from 'react';

const PrivacyPolicyLink: FC = () => {
  const t = useTranslations();

  return (
    <Anchor
      variant="gradient"
      gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
      component={Link}
      href="/"
      target="_blank"
      rel="noopener noreferrer"
    >
      {t('auth.iAcceptThePrivacyPolicy')}
    </Anchor>
  );
};

export default PrivacyPolicyLink;
