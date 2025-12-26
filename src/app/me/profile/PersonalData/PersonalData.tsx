'use client';

import {
  Box,
  Button,
  Group,
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
import { toFormikValidationSchema } from 'zod-formik-adapter';

import { nameValidationSchema } from '@/lib/validation/validation';

const PersonalData = () => {
  const translate = useTranslations();
  const { data: session, update } = useSession();
  const user = session?.user;

  const [isEditMode, setIsEditMode] = useState(false);

  const onSubmit = async (values: { firstName: string; lastName: string }) => {
    try {
      // TODO: Implement the actual API call to update the user
      // For now, we simulate a successful update
      // const result = await dispatch(updateUserThunk({ ... }));

      console.log('Updating user:', values);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update the session with new data locally (optimistic update)
      await update({
        ...session,
        user: {
          ...session?.user,
          firstName: values.firstName,
          lastName: values.lastName,
        },
      });

      setIsEditMode(false);
      notifications.show({
        title: translate('response.success'),
        message: 'Your personal data has been updated', // Ideally should be translated
        color: 'teal',
      });
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
    enableReinitialize: true,
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
        <Title order={5}>{translate('user.personalDataTitle')}</Title>
        {!isEditMode ? (
          <Button variant="subtle" onClick={handlePersonalDataEditable}>
            {translate('general.edit')}
          </Button>
        ) : null}
      </Group>
      {!isEditMode ? (
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
      ) : (
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
            >
              {translate('general.save')}
            </Button>
          </Group>
        </Box>
      )}
    </Paper>
  );
};

export default PersonalData;
