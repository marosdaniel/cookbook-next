'use client';

import { useQuery } from '@apollo/client/react';
import { Center, LoadingOverlay, Stack, Text, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRecipeEditForm } from '@/components/Recipe/Create/hooks/useRecipeEditForm';
import { useRecipeMetadata } from '@/components/Recipe/Create/hooks/useRecipeMetadata';
import RecipeComposer from '@/components/Recipe/Create/RecipeComposer';
import type { ComposerSection } from '@/components/Recipe/Create/types';
import {
  EMPTY_FORM_VALUES,
  recipeToFormValues,
} from '@/components/Recipe/Create/utils';
import { GET_RECIPE_BY_ID } from '@/lib/graphql/queries';
import type { RecipeEditClientProps } from './types';

const RecipeEditClient = ({ recipeId }: Readonly<RecipeEditClientProps>) => {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const translate = useTranslations('recipeEdit');

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.replace('/api/auth/signin');
    }
  }, [authStatus, router]);

  const {
    data: recipeData,
    loading: recipeLoading,
    error: recipeError,
  } = useQuery(GET_RECIPE_BY_ID, {
    variables: { id: recipeId },
    skip: authStatus !== 'authenticated',
  });

  const { labels } = useRecipeMetadata();

  const goToSectionRef = useRef<((section: ComposerSection) => void) | null>(
    null,
  );

  const goToSection = useCallback((section: ComposerSection) => {
    goToSectionRef.current?.(section);
  }, []);

  const recipe = recipeData?.getRecipeById;

  const initialValues = useMemo(() => {
    if (!recipe) {
      return EMPTY_FORM_VALUES;
    }

    return recipeToFormValues(recipe);
  }, [recipe]);

  const initialValuesKey = recipe ? recipe.id : `loading:${recipeId}`;

  const editForm = useRecipeEditForm({
    recipeId,
    initialValues: initialValues ?? EMPTY_FORM_VALUES,
    initialValuesKey,
    onSectionChange: goToSection,
    labels,
  });

  const handleSave = useCallback(() => {
    editForm.form.onSubmit(editForm.handlePublish)();
  }, [editForm.form, editForm.handlePublish]);

  if (authStatus === 'loading' || recipeLoading) {
    return (
      <LoadingOverlay
        visible
        zIndex={1000}
        overlayProps={{ blur: 2, radius: 'sm' }}
      />
    );
  }

  if (authStatus === 'unauthenticated' || !session) {
    return null;
  }

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

  if (!recipe) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="md">
          <Title order={3}>{translate('notFoundTitle')}</Title>
          <Text c="dimmed">{translate('notFoundMessage')}</Text>
        </Stack>
      </Center>
    );
  }

  if (recipe.createdBy !== session.user?.id) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="md">
          <Title order={3}>{translate('notAuthorizedTitle')}</Title>
          <Text c="dimmed">{translate('notAuthorizedMessage')}</Text>
        </Stack>
      </Center>
    );
  }

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
