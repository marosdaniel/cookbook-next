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
import { notifications } from '@mantine/notifications';
import { useFormik } from 'formik';
import { useTranslations } from 'next-intl';
import type { FC } from 'react';
import { useState } from 'react';
import { CiCircleInfo } from 'react-icons/ci';
import { IoArrowBackOutline } from 'react-icons/io5';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { RESET_PASSWORD } from '@/lib/graphql/mutations';
import { resetPasswordValidationSchema } from '@/lib/validation/validation';
import type { ResetPasswordFormValues } from './types';

interface ResetPasswordResponse {
  resetPassword: {
    success: boolean;
    message: string;
  };
}

export const ResetPasswordForm: FC = () => {
  const translate = useTranslations();
  const [resetPassword, { loading }] =
    useMutation<ResetPasswordResponse>(RESET_PASSWORD);
  const [isResetPasswordEmailSent, setIsResetPasswordEmailSent] =
    useState(false);

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    try {
      const result = await resetPassword({
        variables: { email: values.email },
      });

      if (result.data?.resetPassword?.success) {
        setIsResetPasswordEmailSent(true);
        formik.resetForm();

        notifications.show({
          title: translate('response.success'),
          message: result.data.resetPassword.message,
          color: 'green',
        });
      }
    } catch (error: unknown) {
      notifications.show({
        title: translate('response.resetPasswordFailed'),
        message:
          error instanceof Error
            ? error.message
            : (translate('response.somethingWentWrong') as string),
        color: 'red',
      });
    }
  };

  const formik = useFormik<ResetPasswordFormValues>({
    initialValues: {
      email: '',
    },
    validationSchema: toFormikValidationSchema(resetPasswordValidationSchema),
    onSubmit: handleResetPassword,
  });

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
        onSubmit={formik.handleSubmit}
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
              name="email"
              label={translate('user.email')}
              placeholder="your@email.com"
              required
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              error={formik.touched.email && formik.errors.email}
              description={
                formik.touched.email && formik.errors.email
                  ? translate('response.shouldBeValidEmail')
                  : ''
              }
            />

            <Button
              type="submit"
              loading={loading}
              loaderProps={{ type: 'dots' }}
              fullWidth
              disabled={!formik.isValid || !formik.dirty}
            >
              {translate('auth.sendResetLink')}
            </Button>
          </Stack>
        )}

        <Group justify="center" mt="lg">
          <Button
            component="a"
            size="sm"
            href="/login"
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
