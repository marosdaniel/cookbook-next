'use client';

import { Anchor } from '@mantine/core';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { FC } from 'react';
import { PUBLIC_ROUTES } from '../../types/routes';

const PrivacyPolicyLink: FC = () => {
  const translate = useTranslations();

  return (
    <Anchor
      variant="gradient"
      gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
      component={Link}
      href={PUBLIC_ROUTES.PRIVACY_POLICY}
      target="_blank"
      rel="noopener noreferrer"
    >
      {translate('auth.iAcceptThePrivacyPolicy')}
    </Anchor>
  );
};

export default PrivacyPolicyLink;
