'use client';

import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
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
import { useTranslations } from 'next-intl';
import type { FC } from 'react';
import { useState, useTransition } from 'react';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { customValidationSchema } from '@/lib/validation/validation';
import type { CreateUserData, CreateUserVars } from './types';

const CREATE_USER = gql`
  mutation CreateUser($userRegisterInput: UserRegisterInput!) {
    createUser(userRegisterInput: $userRegisterInput) {
      id
      firstName
      lastName
      userName
      email
      role
    }
  }
`;

const SignUpForm: FC = () => {
  const t = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [createUser, { loading }] = useMutation<CreateUserData, CreateUserVars>(
    CREATE_USER,
  );
  const [isPrivacyAccepted, setIsPrivacyAccepted] = useState<boolean>(false);

  const privacyLink = (
    <Anchor
      variant="gradient"
      gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
      component={Link}
      href="/"
      target="_blank"
      rel="noopener noreferrer"
    >
      {t('auth.iAcceptThePrivacyPolicy')}
    </Anchor>
  );

  const handleChangePrivacy = () => {
    setIsPrivacyAccepted(!isPrivacyAccepted);
  };

  const handleSignUp = async (values: CreateUserVars['userRegisterInput']) => {
    try {
      const { data } = await createUser({
        variables: { userRegisterInput: values },
      });

      if (data?.createUser) {
        notifications.show({
          title: t('response.success'),
          message: t('auth.accountCreatedSuccess'),
          color: 'green',
        });

        startTransition(() => {
          router.push('/login');
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred';
      notifications.show({
        title: t('response.error'),
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
    },
    validationSchema: toFormikValidationSchema(customValidationSchema),
    onSubmit: handleSignUp,
  });

  const isSubmitDisabled =
    loading ||
    isPending ||
    !isPrivacyAccepted ||
    !formik.isValid ||
    !formik.dirty;

  return (
    <Container size={520} w={520} my={40} id="registration-page">
      <Title ta="center" c="var(--mantine-color-gray-8)">
        {t('auth.createAccount')}
      </Title>
      <Group mt={5} justify="center" align="center">
        <Text c="dimmed" size="sm" ta="center">
          {t('auth.alreadyHaveAnAccount')}
        </Text>
        <Button variant="transparent" size="sm" component={Link} href="/login">
          {t('auth.login')}
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
          placeholder={t('user.firstName')}
          label={t('user.firstName')}
          name="firstName"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.firstName}
          error={formik.touched.firstName && formik.errors.firstName}
        />
        <TextInput
          required
          id="last-name"
          placeholder={t('user.lastName')}
          mt="md"
          label={t('user.lastName')}
          name="lastName"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.lastName}
          error={formik.touched.lastName && formik.errors.lastName}
        />
        <TextInput
          required
          id="user-name"
          placeholder={t('user.userName')}
          mt="md"
          label={t('user.userName')}
          name="userName"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.userName}
          error={formik.touched.userName && formik.errors.userName}
        />
        <TextInput
          label={t('user.email')}
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
          placeholder={t('user.password')}
          required
          mt="md"
          id="password"
          label={t('user.password')}
          name="password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.password}
          error={formik.touched.password && formik.errors.password}
        />
        <PasswordInput
          placeholder={t('user.confirmPassword')}
          required
          mt="md"
          id="confirm-password"
          label={t('user.confirmPassword')}
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
          label={privacyLink}
          mt="xl"
          checked={isPrivacyAccepted}
          onChange={handleChangePrivacy}
        />

        <Button
          id="submit-button"
          fullWidth
          mt="xl"
          type="submit"
          disabled={isSubmitDisabled}
          loading={loading || isPending}
          loaderProps={{ type: 'dots' }}
        >
          {t('auth.createAnAccountButton')}
        </Button>
      </Paper>
    </Container>
  );
};

export default SignUpForm;
