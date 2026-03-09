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
import { zodResolver } from 'mantine-form-zod-resolver';
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
import { AUTH_ROUTES } from '../../../types/routes';
import {
  showErrorNotification,
  showSuccessNotification,
} from '../../../utils/notifications';
import type { ResetPasswordFormValues, ResetPasswordResponse } from './types';

export const ResetPasswordForm: FC = () => {
  const translate = useTranslations();
  const [resetPassword, { loading }] =
    useMutation<ResetPasswordResponse>(RESET_PASSWORD);
  const [isResetPasswordEmailSent, setIsResetPasswordEmailSent] =
    useState(false);

  const form = useForm<ResetPasswordFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
    },
    // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between zodResolver and Mantine form values
    validate: zodResolver(resetPasswordValidationSchema) as any,
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
        translate('response.somethingWentWrong') as string,
        error,
      );
    }
  };

  const isSubmitDisabled = isFormSubmitDisabled(form, loading);

  return (
    <Container size={460} my={30} id="reset-password-page">
      <Title ta="center" mb="xs">
        {translate('auth.forgotPasswordTitle')}
      </Title>
      <Text c="dimmed" fz="sm" ta="center" mb="xl">
        {translate('auth.forgotPasswordDescription')}
      </Text>

      <Paper
        component="form"
        onSubmit={form.onSubmit(handleResetPassword)}
        withBorder
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
            >
              {translate('auth.sendAnotherEmail')}
            </Button>
          </Stack>
        ) : (
          <Stack gap="md">
            <TextInput
              id="email"
              label={translate('user.email')}
              placeholder="your@email.com"
              required
              key={form.key('email')}
              {...form.getInputProps('email')}
            />

            <Button
              type="submit"
              loading={loading}
              loaderProps={{ type: 'dots' }}
              fullWidth
              disabled={isSubmitDisabled}
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
          >
            {translate('auth.backToLogin')}
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};
