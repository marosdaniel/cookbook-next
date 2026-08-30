'use client';

import { useMutation } from '@apollo/client/react';
import {
  Alert,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconInfoCircle } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { FC } from 'react';
import { useState } from 'react';
import { RESET_PASSWORD } from '@/lib/graphql/mutations';
import {
  isFormSubmitDisabled,
  resetPasswordValidationSchema,
} from '@/lib/validation';
import { zodResolver } from '@/lib/validation/zodResolver';
import { MotionContainer } from '../../../lib/motion/components';
import { AUTH_ROUTES } from '../../../types/routes';
import {
  showErrorNotification,
  showSuccessNotification,
} from '../../../utils/notifications';
import {
  buttonVariants,
  containerVariants,
  fieldListVariants,
  fieldVariants,
  successIconVariants,
  swapVariants,
} from './consts';
import type { ResetPasswordFormValues } from './types';

export const ResetPasswordForm: FC = () => {
  const translate = useTranslations();
  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD);
  const [isResetPasswordEmailSent, setIsResetPasswordEmailSent] =
    useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'error'>('idle');

  const form = useForm<ResetPasswordFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
    },
    validate: zodResolver(resetPasswordValidationSchema, (key) =>
      translate(key),
    ),
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
      setSubmitState('error');
      setTimeout(() => setSubmitState('idle'), 600);
      showErrorNotification(
        translate('response.resetPasswordFailed'),
        translate('response.somethingWentWrong'),
        error,
      );
    }
  };

  const isSubmitDisabled = isFormSubmitDisabled(form, loading);

  return (
    <MotionContainer
      size={460}
      my={30}
      id="reset-password-page"
      data-testid="reset-password-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' as const }}
      >
        <Title ta="center" mb="xs" data-testid="reset-password-title">
          {translate('auth.forgotPasswordTitle')}
        </Title>
        <Text c="dimmed" fz="sm" ta="center" mb="xl">
          {translate('auth.forgotPasswordDescription')}
        </Text>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45, ease: 'easeOut' as const }}
      >
        <Paper
          component="form"
          onSubmit={form.onSubmit(handleResetPassword)}
          withBorder
          data-testid="reset-password-form"
          shadow="md"
          p={30}
          radius="md"
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isResetPasswordEmailSent ? (
              <motion.div
                key="success"
                variants={swapVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ width: '100%' }}
              >
                <Stack gap="md">
                  <Alert
                    variant="light"
                    color="green"
                    title={translate('response.emailSent')}
                    data-testid="reset-password-success-alert"
                    icon={
                      <motion.div
                        variants={successIconVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <IconInfoCircle size={30} />
                      </motion.div>
                    }
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
              </motion.div>
            ) : (
              <motion.div
                key="form"
                variants={swapVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ width: '100%' }}
              >
                <motion.div
                  variants={fieldListVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Stack gap="md">
                    <motion.div variants={fieldVariants}>
                      <TextInput
                        id="email"
                        label={translate('user.email')}
                        placeholder={translate('auth.emailPlaceholder')}
                        required
                        key={form.key('email')}
                        data-testid="reset-password-email-input"
                        {...form.getInputProps('email')}
                      />
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
                        data-testid="reset-password-submit-button"
                      >
                        {translate('auth.sendResetLink')}
                      </Button>
                    </motion.div>
                  </Stack>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <Group justify="center" mt="lg">
            <Button
              component={Link}
              size="sm"
              href={AUTH_ROUTES.LOGIN}
              variant="subtle"
              leftSection={<IconArrowLeft />}
              data-testid="reset-password-back-link"
            >
              {translate('auth.backToLogin')}
            </Button>
          </Group>
        </Paper>
      </motion.div>
    </MotionContainer>
  );
};
