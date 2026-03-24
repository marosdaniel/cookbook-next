'use client';

import { useQuery } from '@apollo/client/react';
import { Center, LoadingOverlay, Stack, Text, Title } from '@mantine/core';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRecipeEditForm } from '@/components/Recipe/Create/hooks/useRecipeEditForm';
import { useRecipeMetadata } from '@/components/Recipe/Create/hooks/useRecipeMetadata';
import { RecipeComposer } from '@/components/Recipe/Create/RecipeComposer';
import type { ComposerSection } from '@/components/Recipe/Create/types';
import {
  EMPTY_FORM_VALUES,
  recipeToFormValues,
} from '@/components/Recipe/Create/utils';
import { GET_RECIPE_BY_ID } from '@/lib/graphql/queries';
import type { RecipeByIdData, RecipeEditClientProps } from './types';

const RecipeEditClient = ({ recipeId }: Readonly<RecipeEditClientProps>) => {
  const { data: session, status: authStatus } = useSession();
  const translate = useTranslations('recipeEdit');

  /* Auth guard */
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      redirect('/api/auth/signin');
    }
  }, [authStatus]);

  /* Fetch recipe data */
  const {
    data: recipeData,
    loading: recipeLoading,
    error: recipeError,
  } = useQuery<RecipeByIdData>(GET_RECIPE_BY_ID, {
    variables: { id: recipeId },
    skip: !session,
  });

  const { labels } = useRecipeMetadata();

  /**
   * Ref that RecipeComposer populates with its internal goToSection callback.
   * This lets form hooks imperatively navigate (e.g. on validation failure).
   */
  const goToSectionRef = useRef<((s: ComposerSection) => void) | null>(null);
  const goToSection = useCallback(
    (section: ComposerSection) => goToSectionRef.current?.(section),
    [],
  );

  /* Transform server data to form values */
  const initialValues = useMemo(() => {
    if (!recipeData?.getRecipeById) return null;
    return recipeToFormValues(recipeData.getRecipeById);
  }, [recipeData]);

  /* Form hook – only create after we have initial values */
  const editForm = useRecipeEditForm({
    recipeId,
    initialValues: initialValues ?? EMPTY_FORM_VALUES,
    onSectionChange: goToSection,
    labels,
  });

  /* Loading states */
  if (authStatus === 'loading' || recipeLoading) {
    return (
      <LoadingOverlay
        visible
        zIndex={1000}
        overlayProps={{ blur: 2, radius: 'sm' }}
      />
    );
  }

  if (!session) return null;

  /* Error state */
  if (recipeError) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="md">
          <Title order={3}>{translate('failedToLoad')}</Title>
          <Text c="dimmed">{recipeError.message}</Text>
        </Stack>
      </Center>
    );
  }

  /* Authorization check – only the author can edit */
  const recipe = recipeData?.getRecipeById;
  if (recipe && session.user?.id && recipe.createdBy !== session.user.id) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="md">
          <Title order={3}>{translate('notAuthorizedTitle')}</Title>
          <Text c="dimmed">{translate('notAuthorizedMessage')}</Text>
        </Stack>
      </Center>
    );
  }

  if (!initialValues) return null;

  const handleSave = () => editForm.form.onSubmit(editForm.handlePublish)();

  return (
    <RecipeComposer
      mode="edit"
      form={editForm.form}
      handlePublish={editForm.handlePublish}
      submitLoading={editForm.submitLoading}
      completion={editForm.completion}
      lastSavedLabel={translate('lastSavedLabel')}
      onSave={handleSave}
      onReset={editForm.resetToOriginal}
      addIngredient={editForm.addIngredient}
      addStep={editForm.addStep}
      headerTitle={translate('headerTitle')}
      submitLabel={translate('submitLabel')}
      resetLabel={translate('resetLabel')}
      goToSectionRef={goToSectionRef}
    />
  );
};

export default RecipeEditClient;
