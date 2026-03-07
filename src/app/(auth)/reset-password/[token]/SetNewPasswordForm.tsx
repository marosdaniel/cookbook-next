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
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { FC } from 'react';
import { useState } from 'react';
import { CiCircleCheck } from 'react-icons/ci';
import { IoArrowBackOutline } from 'react-icons/io5';
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

  const form = useForm<SetNewPasswordFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between zodResolver and Mantine form values
    validate: zodResolver(setNewPasswordValidationSchema) as any,
    validateInputOnBlur: true,
  });

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
        form.reset();

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
        onSubmit={form.onSubmit(handleSetNewPassword)}
        withBorder
        shadow="md"
        p={30}
        radius="md"
      >
        <PasswordInput
          id="newPassword"
          label={translate('auth.newPassword')}
          placeholder={translate('auth.enterNewPassword')}
          required
          description={translate('response.passwordRequirements')}
          mb="md"
          key={form.key('newPassword')}
          {...form.getInputProps('newPassword')}
        />

        <PasswordInput
          id="confirmPassword"
          label={translate('auth.confirmPassword')}
          placeholder={translate('auth.confirmNewPassword')}
          required
          mb="lg"
          key={form.key('confirmPassword')}
          {...form.getInputProps('confirmPassword')}
        />

        <Button
          type="submit"
          loading={loading}
          loaderProps={{ type: 'dots' }}
          fullWidth
          disabled={!form.isValid() || !form.isDirty()}
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
