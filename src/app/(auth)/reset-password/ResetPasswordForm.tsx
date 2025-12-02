'use client';

import { useMutation } from '@apollo/client/react';
import {
  Alert,
  Button,
  Container,
  Group,
  Paper,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useFormik } from 'formik';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { FC } from 'react';
import { useState } from 'react';
import { CiCircleInfo } from 'react-icons/ci';
import { IoArrowBackOutline } from 'react-icons/io5';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { RESET_PASSWORD } from '@/lib/graphql/mutations';
import { resetPasswordValidationSchema } from '@/lib/validation/validation';
import type { ResetPasswordFormValues } from './types';

export const ResetPasswordForm: FC = () => {
  const translate = useTranslations();
  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD);
  const [isResetPasswordEmailSent, setIsResetPasswordEmailSent] =
    useState(false);

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    try {
      await resetPassword({
        variables: { email: values.email },
      });
      setIsResetPasswordEmailSent(true);
      formik.resetForm();
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
      <Title ta="center">{translate('auth.forgotPasswordTitle')}</Title>
      <Text c="dimmed" fz="sm" ta="center">
        {translate('auth.forgotPasswordDescription')}
      </Text>

      <Paper
        component="form"
        onSubmit={formik.handleSubmit}
        withBorder
        shadow="md"
        p={30}
        radius="md"
        mt="xl"
      >
        {isResetPasswordEmailSent ? (
          <Alert
            variant="light"
            color="green"
            title="Email sent successfully"
            icon={<CiCircleInfo size={30} />}
          >
            <Text size="sm">
              {translate('response.emailWithResetLinkSent')}
            </Text>
          </Alert>
        ) : (
          <>
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
            <Group mt="lg">
              <Button
                type="submit"
                loading={loading}
                loaderProps={{ type: 'dots' }}
                fullWidth
                disabled={formik.touched.email && Boolean(formik.errors.email)}
              >
                {translate('auth.resetPasswordButton')}
              </Button>
            </Group>
          </>
        )}
        <Button
          mt="lg"
          component={Link}
          size="sm"
          href="/login"
          variant="subtle"
          pl={0}
          pr={0}
          leftSection={<IoArrowBackOutline />}
        >
          {translate('auth.backToLogin')}
        </Button>
      </Paper>
    </Container>
  );
};
