'use client';

import { useMutation } from '@apollo/client/react';
import {
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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import type { FC } from 'react';
import { useState } from 'react';
import { CREATE_USER } from '@/lib/graphql/mutations';
import { isFormSubmitDisabled, signUpValidationSchema } from '@/lib/validation';
import { zodResolver } from '@/lib/validation/zodResolver';
import PrivacyPolicyLink from '../../../components/PrivacyPolicyLink';
import { AUTH_ROUTES } from '../../../types/routes';

const SignUpForm: FC = () => {
  const translate = useTranslations();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [createUser, { loading }] = useMutation(CREATE_USER);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      firstName: '',
      lastName: '',
      userName: '',
      email: '',
      password: '',
      confirmPassword: '',
      privacyAccepted: false,
    },
    validate: zodResolver(signUpValidationSchema),
    validateInputOnBlur: true,
  });

  const handleSignUp = async (values: typeof form.values) => {
    try {
      const {
        privacyAccepted: _,
        password,
        email,
        ...userRegisterInput
      } = values;
      const { data } = await createUser({
        variables: {
          userRegisterInput: { ...userRegisterInput, password, email },
        },
      });

      if (data?.createUser?.success) {
        notifications.show({
          title: translate('response.success'),
          message: translate('auth.accountCreatedSuccess'),
          color: 'green',
        });

        // Automatically log in the user
        setIsLoggingIn(true);
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.ok) {
          notifications.show({
            title: translate('response.success'),
            message: translate('auth.loginSuccess'),
            color: 'green',
          });
          // Keep loading state active until navigation completes
          router.push('/');
        } else {
          // Registration succeeded but login failed, redirect to login page
          setIsLoggingIn(false);
          router.push(AUTH_ROUTES.LOGIN);
        }
      }
    } catch (error) {
      setIsLoggingIn(false);
      const message =
        error instanceof Error
          ? error.message
          : translate('response.unknownError');
      notifications.show({
        title: translate('response.error'),
        message: message,
        color: 'red',
      });
    }
  };

  const isSubmitDisabled = isFormSubmitDisabled(form, loading, isLoggingIn);

  return (
    <Container maw={520} my={40} id="sign-up-page" data-testid="sign-up-page">
      <Title
        ta="center"
        c="var(--mantine-color-gray-8)"
        data-testid="sign-up-title"
      >
        {translate('auth.createAccount')}
      </Title>
      <Group mt={5} justify="center" align="center">
        <Text c="dimmed" size="sm" ta="center">
          {translate('auth.alreadyHaveAnAccount')}
        </Text>
        <div data-testid="sign-up-login-link">
          <Button
            variant="transparent"
            size="sm"
            component={Link}
            href={AUTH_ROUTES.LOGIN}
            aria-label="Login"
            data-testid="login-link"
          >
            {translate('auth.login')}
          </Button>
        </div>
      </Group>

      <Paper
        component="form"
        withBorder
        shadow="md"
        p={30}
        mt={30}
        radius="md"
        onSubmit={form.onSubmit(handleSignUp)}
        data-testid="sign-up-form"
      >
        <TextInput
          required
          id="first-name"
          placeholder={translate('user.firstName')}
          label={translate('user.firstName')}
          key={form.key('firstName')}
          data-testid="sign-up-first-name-input"
          {...form.getInputProps('firstName')}
        />
        <TextInput
          required
          id="last-name"
          placeholder={translate('user.lastName')}
          mt="md"
          label={translate('user.lastName')}
          key={form.key('lastName')}
          data-testid="sign-up-last-name-input"
          {...form.getInputProps('lastName')}
        />
        <TextInput
          required
          id="user-name"
          placeholder={translate('user.userName')}
          mt="md"
          label={translate('user.userName')}
          key={form.key('userName')}
          data-testid="sign-up-user-name-input"
          {...form.getInputProps('userName')}
        />
        <TextInput
          label={translate('user.email')}
          placeholder={translate('auth.emailPlaceholder')}
          required
          mt="md"
          id="email"
          key={form.key('email')}
          data-testid="sign-up-email-input"
          {...form.getInputProps('email')}
        />
        <PasswordInput
          placeholder={translate('user.password')}
          required
          mt="md"
          id="password"
          label={translate('user.password')}
          key={form.key('password')}
          data-testid="sign-up-password-input"
          {...form.getInputProps('password')}
        />
        <PasswordInput
          placeholder={translate('user.confirmPassword')}
          required
          mt="md"
          id="confirm-password"
          label={translate('user.confirmPassword')}
          key={form.key('confirmPassword')}
          data-testid="sign-up-confirm-password-input"
          {...form.getInputProps('confirmPassword')}
        />

        <Checkbox
          size="md"
          label={<PrivacyPolicyLink />}
          mt="xl"
          key={form.key('privacyAccepted')}
          data-testid="sign-up-privacy-checkbox"
          {...form.getInputProps('privacyAccepted', { type: 'checkbox' })}
        />

        <div data-testid="submit-button">
          <Button
            id="submit-button"
            data-testid="sign-up-submit-button"
            fullWidth
            mt="xl"
            type="submit"
            disabled={isSubmitDisabled}
            loading={loading || isLoggingIn}
            loaderProps={{ type: 'dots' }}
          >
            {translate('auth.createAnAccountButton')}
          </Button>
        </div>
      </Paper>
    </Container>
  );
};

export default SignUpForm;
