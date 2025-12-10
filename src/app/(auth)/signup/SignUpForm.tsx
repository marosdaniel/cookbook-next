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
import { notifications } from '@mantine/notifications';
import { useFormik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import type { FC } from 'react';
import { useState } from 'react';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { CREATE_USER } from '@/lib/graphql/mutations';
import { signUpValidationSchema } from '@/lib/validation/validation';
import PrivacyPolicyLink from '../../../components/PrivacyPolicyLink';
import type { CreateUserData, CreateUserVars } from './types';

const SignUpForm: FC = () => {
  const translate = useTranslations();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [createUser, { loading }] = useMutation<CreateUserData, CreateUserVars>(
    CREATE_USER,
  );

  const handleSignUp = async (
    values: CreateUserVars['userRegisterInput'] & { privacyAccepted: boolean },
  ) => {
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
          router.refresh();
          // Don't set isLoggingIn to false - component will unmount
        } else {
          // Registration succeeded but login failed, redirect to login page
          setIsLoggingIn(false);
          router.push('/login');
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

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      userName: '',
      email: '',
      password: '',
      confirmPassword: '',
      privacyAccepted: false,
    },
    validationSchema: toFormikValidationSchema(signUpValidationSchema),
    onSubmit: handleSignUp,
  });

  const isSubmitDisabled =
    loading || isLoggingIn || !formik.isValid || !formik.dirty;

  return (
    <Container maw={520} my={40} id="sign-up-page">
      <Title ta="center" c="var(--mantine-color-gray-8)">
        {translate('auth.createAccount')}
      </Title>
      <Group mt={5} justify="center" align="center">
        <Text c="dimmed" size="sm" ta="center">
          {translate('auth.alreadyHaveAnAccount')}
        </Text>
        <Button variant="transparent" size="sm" component={Link} href="/login">
          {translate('auth.login')}
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
          required
          id="first-name"
          placeholder={translate('user.firstName')}
          label={translate('user.firstName')}
          name="firstName"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.firstName}
          error={formik.touched.firstName && formik.errors.firstName}
        />
        <TextInput
          required
          id="last-name"
          placeholder={translate('user.lastName')}
          mt="md"
          label={translate('user.lastName')}
          name="lastName"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.lastName}
          error={formik.touched.lastName && formik.errors.lastName}
        />
        <TextInput
          required
          id="user-name"
          placeholder={translate('user.userName')}
          mt="md"
          label={translate('user.userName')}
          name="userName"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.userName}
          error={formik.touched.userName && formik.errors.userName}
        />
        <TextInput
          label={translate('user.email')}
          placeholder="your@email.com"
          required
          mt="md"
          id="email"
          name="email"
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
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.password}
          error={formik.touched.password && formik.errors.password}
        />
        <PasswordInput
          placeholder={translate('user.confirmPassword')}
          required
          mt="md"
          id="confirm-password"
          label={translate('user.confirmPassword')}
          name="confirmPassword"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.confirmPassword}
          error={
            formik.touched.confirmPassword && formik.errors.confirmPassword
          }
        />

        <Checkbox
          size="md"
          label={<PrivacyPolicyLink />}
          mt="xl"
          name="privacyAccepted"
          checked={formik.values.privacyAccepted}
          onChange={formik.handleChange}
          error={
            formik.touched.privacyAccepted && formik.errors.privacyAccepted
          }
        />

        <Button
          id="submit-button"
          fullWidth
          mt="xl"
          type="submit"
          disabled={isSubmitDisabled}
          loading={loading || isLoggingIn}
          loaderProps={{ type: 'dots' }}
        >
          {translate('auth.createAnAccountButton')}
        </Button>
      </Paper>
    </Container>
  );
};

export default SignUpForm;
