'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import {
  Box,
  Button,
  Group,
  LoadingOverlay,
  Paper,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useFormik } from 'formik';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { UPDATE_USER } from '@/lib/graphql/mutations';
import { GET_USER_BY_ID } from '@/lib/graphql/queries';
import { nameValidationSchema } from '@/lib/validation/validation';

const PersonalData = () => {
  const translate = useTranslations();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [isEditMode, setIsEditMode] = useState(false);

  interface GetUserData {
    getUserById: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }

  // Fetch user data from DB directly
  const {
    data: userData,
    loading: userLoading,
    refetch: refetchUser,
  } = useQuery<GetUserData>(GET_USER_BY_ID, {
    variables: { id: userId || '' },
    skip: !userId,
    fetchPolicy: 'network-only', // Ensure we always get the fresh data
  });

  const user = userData?.getUserById;

  // Define types for the mutation response
  interface UpdateUserData {
    updateUser: {
      success: boolean;
      message: string;
      user?: {
        id: string;
        firstName: string;
        lastName: string;
      };
    };
  }

  const [updateUser, { loading: updateLoading }] =
    useMutation<UpdateUserData>(UPDATE_USER);

  const onSubmit = async (values: z.infer<typeof nameValidationSchema>) => {
    try {
      const { data } = await updateUser({
        variables: {
          userUpdateInput: {
            firstName: values.firstName,
            lastName: values.lastName,
          },
        },
      });

      if (data?.updateUser?.success) {
        await refetchUser(); // Refetch user data to update UI from DB
        setIsEditMode(false);
        notifications.show({
          title: translate('response.success'),
          message: 'Your personal data has been updated',
          color: 'teal',
        });
      } else {
        notifications.show({
          title: translate('response.error'),
          message:
            data?.updateUser?.message || translate('response.unknownError'),
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Something went wrong:', error);
      notifications.show({
        title: translate('response.error'),
        message: 'Something went wrong. Please try again later.',
        color: 'red',
      });
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
    },
    enableReinitialize: true, // This is crucial to update form when user data is fetched
    validationSchema: toFormikValidationSchema(nameValidationSchema),
    onSubmit,
  });

  const handlePersonalDataEditable = () => {
    setIsEditMode((prev) => !prev);
  };

  const handleCancelPersonalData = () => {
    formik.resetForm();
    setIsEditMode(false);
  };

  if (userLoading && !user) {
    return (
      <Paper
        shadow="md"
        radius="lg"
        p={{ base: 'md', md: 'xl' }}
        m="32px auto"
        w={{ base: '100%', md: '80%', lg: '75%' }}
        pos="relative"
      >
        <LoadingOverlay visible={true} />
      </Paper>
    );
  }

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
      pos="relative"
    >
      <LoadingOverlay visible={userLoading || updateLoading} />
      <Group mb="lg" justify="space-between" align="baseline">
        <Title order={5}>{translate('user.personalDataTitle')}</Title>
        {!isEditMode && (
          <Button variant="subtle" onClick={handlePersonalDataEditable}>
            {translate('general.edit')}
          </Button>
        )}
      </Group>
      {isEditMode ? (
        <Box>
          <Box mt="md">
            <TextInput
              required
              id="first-name"
              placeholder={translate('user.firstName')}
              mt="md"
              label={translate('user.firstName')}
              name="firstName"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.firstName}
              error={
                formik.touched.firstName && (formik.errors.firstName as string)
              }
              description={
                formik.touched.firstName && formik.errors.firstName
                  ? 'Type here your first name'
                  : ''
              }
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
              error={
                formik.touched.lastName && (formik.errors.lastName as string)
              }
              description={
                formik.touched.lastName && formik.errors.lastName
                  ? 'Type here your last name'
                  : ''
              }
            />
          </Box>
          <Group mt="xl" justify="flex-end">
            <Button
              variant="default"
              size="sm"
              onClick={handleCancelPersonalData}
            >
              {translate('general.cancel')}
            </Button>
            <Button
              size="sm"
              type="submit"
              disabled={!formik.isValid || !formik.dirty}
              loading={updateLoading}
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
              {translate('user.firstName')}
            </Text>
            <Text size="md" fw={500}>
              {user?.firstName}
            </Text>
          </Box>
          <Box mb="lg">
            <Text size="sm" c="dimmed">
              {translate('user.lastName')}
            </Text>
            <Text size="md" fw={500}>
              {user?.lastName}
            </Text>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default PersonalData;
