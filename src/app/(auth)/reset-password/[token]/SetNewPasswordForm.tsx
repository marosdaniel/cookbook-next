'use client';

import { useMutation } from '@apollo/client/react';
import {
  Alert,
  Button,
  Group,
  Paper,
  PasswordInput,
  Text,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { FC } from 'react';
import { useState } from 'react';
import { CiCircleCheck } from 'react-icons/ci';
import { IoArrowBackOutline } from 'react-icons/io5';
import { SET_NEW_PASSWORD } from '@/lib/graphql/mutations';
import {
  isFormSubmitDisabled,
  setNewPasswordValidationSchema,
} from '@/lib/validation';
import { zodResolver } from '@/lib/validation/zodResolver';
import { MotionContainer } from '../../../../lib/motion/components';
import { AUTH_ROUTES } from '../../../../types/routes';
import { showErrorNotification } from '../../../../utils/notifications';
import { AUTH_CONSTANTS } from '../../consts';
import {
  buttonVariants,
  containerVariants,
  fieldListVariants,
  fieldVariants,
  successIconVariants,
} from './consts';
import type { SetNewPasswordFormValues } from './types';

export const SetNewPasswordForm: FC = () => {
  const translate = useTranslations();
  const router = useRouter();
  const params = useParams();
  const token = Array.isArray(params?.token) ? params.token[0] : params?.token;

  const [setNewPassword, { loading }] = useMutation(SET_NEW_PASSWORD);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'error'>('idle');

  const form = useForm<SetNewPasswordFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validate: zodResolver(setNewPasswordValidationSchema, (key) =>
      translate(key),
    ),
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

        setTimeout(() => {
          router.push(AUTH_ROUTES.LOGIN);
        }, AUTH_CONSTANTS.PASSWORD_RESET_REDIRECT_DELAY);
      }
    } catch (error: unknown) {
      setSubmitState('error');
      setTimeout(() => setSubmitState('idle'), 600);
      showErrorNotification(
        translate('response.passwordResetFailed'),
        translate('response.somethingWentWrong'),
        error,
      );
    }
  };

  const isSubmitDisabled = isFormSubmitDisabled(form, loading);

  if (isPasswordReset) {
    return (
      <MotionContainer
        size={460}
        my={30}
        id="password-reset-success"
        data-testid="password-reset-success"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' as const }}
        >
          <Title ta="center" mb="md" data-testid="password-reset-success-title">
            {translate('auth.passwordResetSuccessTitle')}
          </Title>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' as const }}
        >
          <Alert
            variant="light"
            color="green"
            title={translate('auth.passwordResetSuccessTitle')}
            data-testid="password-reset-success-alert"
            icon={
              <motion.div
                variants={successIconVariants}
                initial="hidden"
                animate="visible"
              >
                <CiCircleCheck size={30} />
              </motion.div>
            }
          >
            <Text size="sm" mb="md">
              {translate('response.passwordResetSuccess')}
            </Text>
            <Text size="sm" c="dimmed" mb="sm">
              {translate('auth.redirectingToLogin')}
            </Text>

            <div
              style={{
                height: 4,
                borderRadius: 2,
                backgroundColor: 'var(--mantine-color-green-1)',
                overflow: 'hidden',
              }}
            >
              <motion.div
                style={{
                  height: '100%',
                  backgroundColor: 'var(--mantine-color-green-6)',
                  borderRadius: 2,
                }}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{
                  duration: AUTH_CONSTANTS.PASSWORD_RESET_REDIRECT_DELAY / 1000,
                  ease: 'linear',
                }}
              />
            </div>
          </Alert>
        </motion.div>
      </MotionContainer>
    );
  }

  const fields = [
    {
      id: 'newPassword',
      node: (
        <PasswordInput
          id="newPassword"
          label={translate('auth.newPassword')}
          placeholder={translate('auth.enterNewPassword')}
          required
          description={translate('response.passwordRequirements')}
          mb="md"
          key={form.key('newPassword')}
          data-testid="set-new-password-input"
          {...form.getInputProps('newPassword')}
        />
      ),
    },
    {
      id: 'confirmPassword',
      node: (
        <PasswordInput
          id="confirmPassword"
          label={translate('auth.confirmPassword')}
          placeholder={translate('auth.confirmNewPassword')}
          required
          mb="lg"
          key={form.key('confirmPassword')}
          data-testid="set-new-password-confirm-input"
          {...form.getInputProps('confirmPassword')}
        />
      ),
    },
  ];

  return (
    <MotionContainer
      size={460}
      my={30}
      id="set-new-password-page"
      data-testid="set-new-password-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' as const }}
      >
        <Title ta="center" mb="xs" data-testid="set-new-password-title">
          {translate('auth.setNewPasswordTitle')}
        </Title>
        <Text c="dimmed" fz="sm" ta="center" mb="xl">
          {translate('auth.setNewPasswordDescription')}
        </Text>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45, ease: 'easeOut' as const }}
      >
        <Paper
          component="form"
          onSubmit={form.onSubmit(handleSetNewPassword)}
          withBorder
          data-testid="set-new-password-form"
          shadow="md"
          p={30}
          radius="md"
        >
          <motion.div
            variants={fieldListVariants}
            initial="hidden"
            animate="visible"
          >
            {fields.map(({ id, node }) => (
              <motion.div key={id} variants={fieldVariants}>
                {node}
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={buttonVariants}
            animate={submitState}
            whileTap="tap"
          >
            <Button
              type="submit"
              loading={loading}
              loaderProps={{ type: 'dots' }}
              fullWidth
              disabled={isSubmitDisabled}
              data-testid="set-new-password-submit-button"
            >
              {translate('auth.setNewPasswordButton')}
            </Button>
          </motion.div>

          <Group justify="center" mt="lg">
            <Button
              component={Link}
              size="sm"
              href={AUTH_ROUTES.LOGIN}
              variant="subtle"
              leftSection={<IoArrowBackOutline />}
              data-testid="set-new-password-back-link"
            >
              {translate('auth.backToLogin')}
            </Button>
          </Group>
        </Paper>
      </motion.div>
    </MotionContainer>
  );
};
