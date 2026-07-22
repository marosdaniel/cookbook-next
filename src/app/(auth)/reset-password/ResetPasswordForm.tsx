'use client';

import { useMutation } from '@apollo/client/react';
import {
  Alert,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { FC } from 'react';
import { useState } from 'react';
import { CiCircleInfo } from 'react-icons/ci';
import { IoArrowBackOutline } from 'react-icons/io5';
import { RESET_PASSWORD } from '@/lib/graphql/mutations';
import {
  isFormSubmitDisabled,
  resetPasswordValidationSchema,
} from '@/lib/validation';
import { zodResolver } from '@/lib/validation/zodResolver';
import { AUTH_ROUTES } from '../../../types/routes';
import {
  showErrorNotification,
  showSuccessNotification,
} from '../../../utils/notifications';
import type { ResetPasswordFormValues } from './types';

export const ResetPasswordForm: FC = () => {
  const translate = useTranslations();
  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD);
  const [isResetPasswordEmailSent, setIsResetPasswordEmailSent] =
    useState(false);

  const form = useForm<ResetPasswordFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
    },
    validate: zodResolver(resetPasswordValidationSchema),
    validateInputOnBlur: true,
  });

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    try {
      const result = await resetPassword({
        variables: { email: values.email },
      });

      if (result.data?.resetPassword?.success) {
        setIsResetPasswordEmailSent(true);
        form.reset();

        showSuccessNotification(
          translate('response.success'),
          result.data.resetPassword.message,
        );
      }
    } catch (error: unknown) {
      showErrorNotification(
        translate('response.resetPasswordFailed'),
        translate('response.somethingWentWrong'),
        error,
      );
    }
  };

  const isSubmitDisabled = isFormSubmitDisabled(form, loading);

  return (
    <Container
      size={460}
      my={30}
      id="reset-password-page"
      data-testid="reset-password-page"
    >
      <Title ta="center" mb="xs" data-testid="reset-password-title">
        {translate('auth.forgotPasswordTitle')}
      </Title>
      <Text c="dimmed" fz="sm" ta="center" mb="xl">
        {translate('auth.forgotPasswordDescription')}
      </Text>

      <Paper
        component="form"
        onSubmit={form.onSubmit(handleResetPassword)}
        withBorder
        data-testid="reset-password-form"
        shadow="md"
        p={30}
        radius="md"
      >
        {isResetPasswordEmailSent ? (
          <Stack gap="md">
            <Alert
              variant="light"
              color="green"
              title={translate('response.emailSent')}
              data-testid="reset-password-success-alert"
              icon={<CiCircleInfo size={30} />}
            >
              <Text size="sm">
                {translate('response.emailWithResetLinkSent')}
              </Text>
              <Text size="sm" mt="sm" c="dimmed">
                {translate('response.checkSpamFolder')}
              </Text>
            </Alert>

            <Button
              variant="light"
              onClick={() => setIsResetPasswordEmailSent(false)}
              fullWidth
              data-testid="reset-password-send-another-button"
            >
              {translate('auth.sendAnotherEmail')}
            </Button>
          </Stack>
        ) : (
          <Stack gap="md">
            <TextInput
              id="email"
              label={translate('user.email')}
              placeholder={translate('auth.emailPlaceholder')}
              required
              key={form.key('email')}
              data-testid="reset-password-email-input"
              {...form.getInputProps('email')}
            />

            <Button
              type="submit"
              loading={loading}
              loaderProps={{ type: 'dots' }}
              fullWidth
              disabled={isSubmitDisabled}
              data-testid="reset-password-submit-button"
            >
              {translate('auth.sendResetLink')}
            </Button>
          </Stack>
        )}

        <Group justify="center" mt="lg">
          <Button
            component={Link}
            size="sm"
            href={AUTH_ROUTES.LOGIN}
            variant="subtle"
            leftSection={<IoArrowBackOutline />}
            data-testid="reset-password-back-link"
          >
            {translate('auth.backToLogin')}
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};
