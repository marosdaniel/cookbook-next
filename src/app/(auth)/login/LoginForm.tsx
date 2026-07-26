'use client';

import {
  Anchor,
  Button,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { motion, type Variants } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import type { FC, MouseEvent } from 'react';
import { useState } from 'react';
import { zodResolver } from '@/lib/validation/zodResolver';
import {
  showErrorNotification,
  showSuccessNotification,
} from '@/utils/notifications';
import { loginValidationSchema } from '../../../lib/validation';
import { AUTH_ROUTES } from '../../../types/routes';
import type { LoginFormValues } from './types';

// --- Animation variants ---

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
};

const fieldListVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
};

const buttonVariants: Variants = {
  idle: { scale: 1 },
  tap: { scale: 0.97 },
  error: {
    x: [-6, 6, -4, 4, 0],
    transition: { duration: 0.35 },
  },
};

// ---

const MotionContainer = motion.create(Container);

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

  const handleNavigateToResetPassword = (
    event: MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault();
    router.push(AUTH_ROUTES.RESET_PASSWORD);
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
        showErrorNotification(
          translate('response.error'),
          translate('auth.invalidCredentials'),
        );
        setIsSigningIn(false);
        setSubmitState('error');
        setTimeout(() => setSubmitState('idle'), 600);
        return;
      }

      if (result?.ok) {
        showSuccessNotification(
          translate('response.success'),
          translate('auth.loginSuccess'),
        );
        // Navigation will unmount component, keep loading state
        router.push('/');
      }
    } catch {
      showErrorNotification(
        translate('response.error'),
        translate('auth.loginError'),
      );
      setIsSigningIn(false);
      setSubmitState('error');
      setTimeout(() => setSubmitState('idle'), 600);
    }
  };

  const isLoginDisabled = form.submitting || isSigningIn;

  const fields = [
    {
      id: 'email',
      node: (
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
      ),
    },
    {
      id: 'password',
      node: (
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
      ),
    },
  ];

  return (
    <MotionContainer
      maw={520}
      my={40}
      id="login-page"
      data-testid="login-page"
      variants={containerVariants}
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

          <motion.div variants={fieldVariants}>
            <Group justify="flex-end" mt="lg">
              <Anchor
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                size="sm"
                component="a"
                href={AUTH_ROUTES.RESET_PASSWORD}
                onClick={handleNavigateToResetPassword}
                data-testid="forgot-password"
              >
                {translate('auth.forgotPassword')}
              </Anchor>
            </Group>
          </motion.div>

          <motion.div
            variants={buttonVariants}
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
              loading={form.submitting || isSigningIn}
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
