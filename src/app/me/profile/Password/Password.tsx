'use client';

import { useMutation } from '@apollo/client/react';
import {
  Box,
  Button,
  Group,
  Paper,
  PasswordInput,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useFormik } from 'formik';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';

import { CHANGE_PASSWORD } from '@/lib/graphql/mutations';
import { passwordEditValidationSchema } from '@/lib/validation/validation';

const Password = () => {
  const translate = useTranslations();
  const [isEditMode, setIsEditMode] = useState(false);

  // Define types for the mutation response
  interface ChangePasswordData {
    changePassword: {
      success: boolean;
      message: string;
    };
  }

  const [changePassword, { loading }] = useMutation<ChangePasswordData>(
    CHANGE_PASSWORD,
    {
      onCompleted: (data) => {
        if (data?.changePassword?.success) {
          notifications.show({
            title: translate('response.success'),
            message: translate('auth.passwordChangedSuccess'), // Ensure this key exists or use a generic one
            color: 'teal',
          });
          handleCancelPasswordEdit();
        } else {
          notifications.show({
            title: translate('response.error'),
            message:
              data?.changePassword?.message ||
              translate('response.unknownError'),
            color: 'red',
          });
        }
      },
      onError: (error) => {
        notifications.show({
          title: translate('response.error'),
          message: error.message || translate('response.unknownError'),
          color: 'red',
        });
      },
    },
  );

  const onSubmit = async (
    values: z.infer<typeof passwordEditValidationSchema>,
  ) => {
    try {
      await changePassword({
        variables: {
          passwordEditInput: {
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
            confirmNewPassword: values.confirmNewPassword,
          },
        },
      });
    } catch (error) {
      console.error('Something went wrong:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    validationSchema: toFormikValidationSchema(passwordEditValidationSchema),
    onSubmit,
  });

  const handleCancelPasswordEdit = () => {
    formik.resetForm();
    setIsEditMode(false);
  };

  return (
    <Paper
      component="form"
      onSubmit={formik.handleSubmit}
      shadow="md"
      radius="lg"
      p={{
        base: 'md',
        md: 'xl',
      }}
      m="32px auto"
      w={{ base: '100%', md: '80%', lg: '75%' }}
    >
      <Group mb="lg" justify="space-between" align="baseline">
        <Title order={5}>{translate('user.changePasswordTitle')}</Title>
        {!isEditMode && (
          <Button variant="subtle" onClick={() => setIsEditMode(true)}>
            {translate('general.edit')}
          </Button>
        )}
      </Group>
      {isEditMode ? (
        <Box>
          <Box mt="md">
            <PasswordInput
              required
              id="password"
              placeholder={translate('user.password')}
              mt="md"
              label={translate('user.currentPassword')}
              name="currentPassword"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.currentPassword}
              error={
                formik.touched.currentPassword && formik.errors.currentPassword
              }
              description={
                formik.touched.currentPassword && formik.errors.currentPassword
                  ? formik.errors.currentPassword
                  : ''
              }
            />
            <PasswordInput
              required
              id="new-password"
              placeholder={translate('user.newPassword')}
              mt="md"
              label={translate('user.newPassword')}
              name="newPassword"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.newPassword}
              error={formik.touched.newPassword && formik.errors.newPassword}
              description={
                formik.touched.newPassword && formik.errors.newPassword
                  ? formik.errors.newPassword
                  : ''
              }
            />
            <PasswordInput
              required
              id="confirm-password"
              placeholder={translate('user.confirmPassword')}
              mt="md"
              label={translate('user.confirmPassword')}
              name="confirmNewPassword"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.confirmNewPassword}
              error={
                formik.touched.confirmNewPassword &&
                formik.errors.confirmNewPassword
              }
              description={
                formik.touched.confirmNewPassword &&
                formik.errors.confirmNewPassword
                  ? formik.errors.confirmNewPassword
                  : ''
              }
            />
          </Box>
          <Group mt="xl" justify="flex-end">
            <Button
              variant="default"
              size="sm"
              onClick={handleCancelPasswordEdit}
            >
              {translate('general.cancel')}
            </Button>
            <Button
              size="sm"
              type="submit"
              disabled={!formik.isValid || !formik.dirty}
              loading={loading}
              loaderProps={{ type: 'dots' }}
            >
              {translate('general.save')}
            </Button>
          </Group>
        </Box>
      ) : (
        <Box>
          <Box mb="lg">
            <Text size="sm" c="dimmed">
              {translate('user.password')}
            </Text>
            <Text size="md">***************</Text>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default Password;
