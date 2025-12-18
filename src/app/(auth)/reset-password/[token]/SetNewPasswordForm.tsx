'use client';

import { useMutation } from '@apollo/client/react';
import {
  Alert,
  Button,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  Title,
} from '@mantine/core';
import { useFormik } from 'formik';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { FC } from 'react';
import { useState } from 'react';
import { CiCircleCheck } from 'react-icons/ci';
import { IoArrowBackOutline } from 'react-icons/io5';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { SET_NEW_PASSWORD } from '@/lib/graphql/mutations';
import { setNewPasswordValidationSchema } from '@/lib/validation/validation';
import { AUTH_ROUTES } from '../../../../types/routes';
import { showErrorNotification } from '../../../../utils/notifications';
import { AUTH_CONSTANTS } from '../../consts';
import type { SetNewPasswordFormValues, SetNewPasswordResponse } from './types';

export const SetNewPasswordForm: FC = () => {
  const translate = useTranslations();
  const router = useRouter();
  const params = useParams();
  const token = params?.token;

  const [setNewPassword, { loading }] =
    useMutation<SetNewPasswordResponse>(SET_NEW_PASSWORD);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  const handleSetNewPassword = async (values: SetNewPasswordFormValues) => {
    if (!token) {
      showErrorNotification(
        translate('response.error'),
        translate('response.invalidResetToken'),
      );
      return;
    }

    try {
      const result = await setNewPassword({
        variables: {
          token,
          newPassword: values.newPassword,
        },
      });

      if (result.data?.setNewPassword?.success) {
        setIsPasswordReset(true);
        formik.resetForm();

        // Redirect to login after delay
        setTimeout(() => {
          router.push(AUTH_ROUTES.LOGIN);
        }, AUTH_CONSTANTS.PASSWORD_RESET_REDIRECT_DELAY);
      }
    } catch (error: unknown) {
      showErrorNotification(
        translate('response.passwordResetFailed'),
        translate('response.somethingWentWrong'),
        error,
      );
    }
  };

  const formik = useFormik<SetNewPasswordFormValues>({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: toFormikValidationSchema(setNewPasswordValidationSchema),
    onSubmit: handleSetNewPassword,
  });

  if (isPasswordReset) {
    return (
      <Container size={460} my={30} id="password-reset-success">
        <Title ta="center" mb="md">
          {translate('auth.passwordResetSuccessTitle')}
        </Title>
        <Alert
          variant="light"
          color="green"
          title={translate('auth.passwordResetSuccessTitle')}
          icon={<CiCircleCheck size={30} />}
        >
          <Text size="sm" mb="md">
            {translate('response.passwordResetSuccess')}
          </Text>
          <Text size="sm" c="dimmed">
            {translate('auth.redirectingToLogin')}
          </Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size={460} my={30} id="set-new-password-page">
      <Title ta="center" mb="xs">
        {translate('auth.setNewPasswordTitle')}
      </Title>
      <Text c="dimmed" fz="sm" ta="center" mb="xl">
        {translate('auth.setNewPasswordDescription')}
      </Text>

      <Paper
        component="form"
        onSubmit={formik.handleSubmit}
        withBorder
        shadow="md"
        p={30}
        radius="md"
      >
        <PasswordInput
          id="newPassword"
          name="newPassword"
          label={translate('auth.newPassword')}
          placeholder={translate('auth.enterNewPassword')}
          required
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.newPassword}
          error={formik.touched.newPassword && formik.errors.newPassword}
          description={translate('response.passwordRequirements')}
          mb="md"
        />

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label={translate('auth.confirmPassword')}
          placeholder={translate('auth.confirmNewPassword')}
          required
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.confirmPassword}
          error={
            formik.touched.confirmPassword && formik.errors.confirmPassword
          }
          mb="lg"
        />

        <Button
          type="submit"
          loading={loading}
          loaderProps={{ type: 'dots' }}
          fullWidth
          disabled={!formik.isValid || !formik.dirty}
        >
          {translate('auth.setNewPasswordButton')}
        </Button>

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
