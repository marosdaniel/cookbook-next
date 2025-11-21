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
import { notifications } from '@mantine/notifications';
import { useFormik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import type { FC } from 'react';
import { useState } from 'react';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { loginValidationSchema } from '../../../lib/validation';
import type { LoginFormValues } from './types';

export const LoginForm: FC = () => {
  const translate = useTranslations();
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

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

        router.push('/');
        router.refresh();
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

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: toFormikValidationSchema(loginValidationSchema),
    onSubmit: handleLogin,
  });

  const isLoginDisabled =
    formik.isSubmitting || isSigningIn || !formik.isValid || !formik.dirty;

  return (
    <Container size={520} w={520} my={40} id="login-page">
      <Title ta="center" c="var(--mantine-color-gray-8)">
        {translate('auth.welcomeBack')}
      </Title>
      <Group mt={5} justify="center" align="center">
        <Text c="dimmed" size="sm" ta="center">
          {translate('auth.dontYouHaveAnAccount')}
        </Text>
        <Button variant="transparent" size="sm" component={Link} href="/signup">
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
        onSubmit={formik.handleSubmit}
      >
        <TextInput
          label={translate('user.email')}
          placeholder="your@email.com"
          required
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
          error={formik.touched.email && formik.errors.email}
        />
        <PasswordInput
          placeholder={translate('user.password')}
          required
          mt="md"
          id="password"
          label={translate('user.password')}
          name="password"
          autoComplete="current-password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.password}
          error={formik.touched.password && formik.errors.password}
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
            href="/reset-password"
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
          loading={formik.isSubmitting || isSigningIn}
          loaderProps={{ type: 'dots' }}
        >
          {translate('auth.signIn')}
        </Button>
      </Paper>
    </Container>
  );
};
