'use client';

import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { zodResolver } from 'mantine-form-zod-resolver';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import type { FC } from 'react';
import { useState } from 'react';
import { loginValidationSchema } from '../../../lib/validation';
import { AUTH_ROUTES } from '../../../types/routes';
import type { LoginFormValues } from './types';

export const LoginForm: FC = () => {
  const translate = useTranslations();
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const form = useForm<LoginFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
    },
    // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between zodResolver and Mantine form values
    validate: zodResolver(loginValidationSchema) as any,
    validateInputOnBlur: true,
  });

  const handleLogin = async (values: LoginFormValues) => {
    try {
      setIsSigningIn(true);
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
        rememberMe,
      });

      if (result?.error) {
        notifications.show({
          title: translate('response.error'),
          message: translate('auth.invalidCredentials'),
          color: 'red',
          position: 'top-right',
        });
        setIsSigningIn(false);
        return;
      }

      if (result?.ok) {
        notifications.show({
          title: translate('response.success'),
          message: translate('auth.loginSuccess'),
          color: 'green',
        });
        // Navigation will unmount component, keep loading state
        router.push('/');
      }
    } catch {
      notifications.show({
        title: translate('response.error'),
        message: translate('auth.loginError'),
        color: 'red',
      });
      setIsSigningIn(false);
    }
  };

  // Keep submit disabled while an auth request is in flight.
  // Field-level validation still runs on blur and on submit.
  const isLoginDisabled = form.submitting || isSigningIn;

  return (
    <Container maw={520} my={40} id="login-page">
      <Title ta="center" c="var(--mantine-color-gray-8)">
        {translate('auth.welcomeBack')}
      </Title>
      <Group mt={5} justify="center" align="center">
        <Text c="dimmed" size="sm" ta="center">
          {translate('auth.dontYouHaveAnAccount')}
        </Text>
        <Button
          variant="transparent"
          size="sm"
          component={Link}
          href={AUTH_ROUTES.SIGNUP}
        >
          {translate('auth.createAccountButton')}
        </Button>
      </Group>
      <Paper
        component="form"
        withBorder
        shadow="md"
        p={30}
        mt={30}
        radius="md"
        onSubmit={form.onSubmit(handleLogin)}
      >
        <TextInput
          label={translate('user.email')}
          placeholder="your@email.com"
          required
          id="email"
          type="email"
          autoComplete="email"
          key={form.key('email')}
          {...form.getInputProps('email')}
        />
        <PasswordInput
          placeholder={translate('user.password')}
          required
          mt="md"
          id="password"
          label={translate('user.password')}
          autoComplete="current-password"
          key={form.key('password')}
          {...form.getInputProps('password')}
        />
        <Group justify="space-between" mt="lg">
          <Checkbox
            label={translate('auth.rememberMe')}
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.currentTarget.checked)}
          />
          <Anchor
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
            component={Link}
            size="sm"
            href={AUTH_ROUTES.RESET_PASSWORD}
          >
            {translate('auth.forgotPassword')}
          </Anchor>
        </Group>
        <Button
          id="login-button"
          fullWidth
          mt="xl"
          type="submit"
          disabled={isLoginDisabled}
          loading={form.submitting || isSigningIn}
          loaderProps={{ type: 'dots' }}
        >
          {translate('auth.signIn')}
        </Button>
      </Paper>
    </Container>
  );
};
