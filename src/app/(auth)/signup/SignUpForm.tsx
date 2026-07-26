'use client';

import { useMutation } from '@apollo/client/react';
import {
  Button,
  Checkbox,
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
import { CREATE_USER } from '@/lib/graphql/mutations';
import { isFormSubmitDisabled, signUpValidationSchema } from '@/lib/validation';
import { zodResolver } from '@/lib/validation/zodResolver';
import {
  showErrorNotification,
  showSuccessNotification,
} from '@/utils/notifications';
import PrivacyPolicyLink from '../../../components/PrivacyPolicyLink';
import { MotionContainer } from '../../../lib/motion/components';
import { AUTH_ROUTES } from '../../../types/routes';
import {
  buttonVariants,
  containerVariants,
  fieldListVariants,
  fieldVariants,
} from './consts';

const SignUpForm: FC = () => {
  const translate = useTranslations();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>(
    'idle',
  );
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
    validate: zodResolver(signUpValidationSchema, (key) => translate(key)),
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
        setSubmitState('success');
        showSuccessNotification(
          translate('response.success'),
          translate('auth.accountCreatedSuccess'),
        );

        setIsLoggingIn(true);
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.ok) {
          showSuccessNotification(
            translate('response.success'),
            translate('auth.loginSuccess'),
          );
          router.push('/');
        } else {
          setIsLoggingIn(false);
          router.push(AUTH_ROUTES.LOGIN);
        }
      }
    } catch (error) {
      setIsLoggingIn(false);
      setSubmitState('error');
      setTimeout(() => setSubmitState('idle'), 600);
      showErrorNotification(
        translate('response.error'),
        translate('response.unknownError'),
        error,
      );
    }
  };

  const isSubmitDisabled = isFormSubmitDisabled(form, loading, isLoggingIn);

  const fields = [
    {
      id: 'firstName',
      node: (
        <TextInput
          required
          id="first-name"
          placeholder={translate('user.firstName')}
          label={translate('user.firstName')}
          key={form.key('firstName')}
          data-testid="sign-up-first-name-input"
          {...form.getInputProps('firstName')}
        />
      ),
    },
    {
      id: 'lastName',
      node: (
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
      ),
    },
    {
      id: 'userName',
      node: (
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
      ),
    },
    {
      id: 'email',
      node: (
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
          key={form.key('password')}
          data-testid="sign-up-password-input"
          {...form.getInputProps('password')}
        />
      ),
    },
    {
      id: 'confirmPassword',
      node: (
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
      ),
    },
  ];

  return (
    <MotionContainer
      maw={520}
      my={40}
      id="sign-up-page"
      data-testid="sign-up-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Title
          ta="center"
          c="var(--mantine-color-gray-8)"
          data-testid="sign-up-title"
        >
          {translate('auth.createAccount')}
        </Title>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.35 }}
      >
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
          onSubmit={form.onSubmit(handleSignUp)}
          data-testid="sign-up-form"
        >
          {/* Staggered fields */}
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
            <Checkbox
              size="md"
              label={<PrivacyPolicyLink />}
              mt="xl"
              key={form.key('privacyAccepted')}
              data-testid="sign-up-privacy-checkbox"
              {...form.getInputProps('privacyAccepted', { type: 'checkbox' })}
            />
          </motion.div>

          <div data-testid="submit-button">
            <motion.div
              variants={buttonVariants}
              animate={submitState}
              whileTap="tap"
            >
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
            </motion.div>
          </div>
        </Paper>
      </motion.div>
    </MotionContainer>
  );
};

export default SignUpForm;
