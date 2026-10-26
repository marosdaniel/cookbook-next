'use client';

import {
  Anchor,
  Button,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import type { FC } from 'react';
import { useState } from 'react';
import { MotionContainer } from '@/lib/motion/components';
import {
  authButtonVariants,
  authContainerVariants,
  authFieldListVariants,
  authFieldVariants,
} from '@/lib/motion/variants';
import { loginValidationSchema } from '@/lib/validation';
import { zodResolver } from '@/lib/validation/zodResolver';
import { AUTH_ROUTES } from '@/types/routes';
import {
  showErrorNotification,
  showSuccessNotification,
} from '@/utils/notifications';
import type { LoginFormValues } from './types';

export const LoginForm: FC = () => {
  const translate = useTranslations();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'error'>('idle');

  const form = useForm<LoginFormValues>({
    mode: 'controlled',
    initialValues: {
      email: '',
      password: '',
    },
    validate: zodResolver(loginValidationSchema, (key) => translate(key)),
  });

  const showLoginError = (message: string) => {
    showErrorNotification(translate('response.error'), message);
    setIsSigningIn(false);
    setSubmitState('error');
    setTimeout(() => setSubmitState('idle'), 600);
  };

  const handleLogin = async (values: LoginFormValues) => {
    try {
      setIsSigningIn(true);
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        showLoginError(translate('auth.invalidCredentials'));
        return;
      }

      if (result?.ok) {
        showSuccessNotification(
          translate('response.success'),
          translate('auth.loginSuccess'),
        );
        // Navigation will unmount component, keep loading state
        router.push('/');
        return;
      }

      showLoginError(translate('auth.loginError'));
    } catch {
      showLoginError(translate('auth.loginError'));
    }
  };

  const isLoginDisabled = form.submitting || isSigningIn;

  return (
    <MotionContainer
      maw={520}
      my={40}
      id="login-page"
      data-testid="login-page"
      variants={authContainerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' as const }}
      >
        <Title
          ta="center"
          c="var(--mantine-color-gray-8)"
          data-testid="login-title"
        >
          {translate('auth.welcomeBack')}
        </Title>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.35 }}
      >
        <Group mt={5} justify="center" align="center">
          <Text c="dimmed" size="sm" ta="center">
            {translate('auth.dontYouHaveAnAccount')}
          </Text>
          <Button
            variant="transparent"
            size="sm"
            component={Link}
            href={AUTH_ROUTES.SIGNUP}
            data-testid="create-account"
          >
            {translate('auth.createAccountButton')}
          </Button>
        </Group>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45, ease: 'easeOut' as const }}
      >
        <Paper
          component="form"
          withBorder
          shadow="md"
          p={30}
          mt={30}
          radius="md"
          onSubmit={form.onSubmit(handleLogin)}
          data-testid="login-form"
        >
          <motion.div
            variants={authFieldListVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={authFieldVariants}>
              <TextInput
                label={translate('user.email')}
                placeholder={translate('auth.emailPlaceholder')}
                required
                id="email"
                type="email"
                autoComplete="email"
                data-testid="login-email-input"
                {...form.getInputProps('email')}
              />
            </motion.div>

            <motion.div variants={authFieldVariants}>
              <PasswordInput
                placeholder={translate('user.password')}
                required
                mt="md"
                id="password"
                label={translate('user.password')}
                autoComplete="current-password"
                data-testid="login-password-input"
                {...form.getInputProps('password')}
              />
            </motion.div>
          </motion.div>

          <motion.div variants={authFieldVariants}>
            <Group justify="flex-end" mt="lg">
              <Anchor
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                size="sm"
                component={Link}
                href={AUTH_ROUTES.RESET_PASSWORD}
                data-testid="forgot-password"
              >
                {translate('auth.forgotPassword')}
              </Anchor>
            </Group>
          </motion.div>

          <motion.div
            variants={authButtonVariants}
            animate={submitState}
            whileTap="tap"
          >
            <Button
              id="login-button"
              data-testid="login-button"
              fullWidth
              mt="xl"
              type="submit"
              disabled={isLoginDisabled}
              loading={isLoginDisabled}
              loaderProps={{ type: 'dots' }}
            >
              {translate('auth.signIn')}
            </Button>
          </motion.div>
        </Paper>
      </motion.div>
    </MotionContainer>
  );
};
