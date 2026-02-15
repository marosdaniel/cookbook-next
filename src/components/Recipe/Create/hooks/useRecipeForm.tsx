import { useMutation } from '@apollo/client/react';
import { useDebouncedValue, useLocalStorage } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconDeviceFloppy } from '@tabler/icons-react';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { CREATE_RECIPE } from '@/lib/graphql/mutations';
import { recipeFormValidationSchema } from '@/lib/validation/validation';
import type {
  DraftState,
  RecipeFormValues,
  TIngredient,
  TPreparationStep,
  UseRecipeFormProps,
} from '../types';
import {
  computeCompletion,
  DRAFT_STORAGE_KEY,
  transformValuesToInput,
} from '../utils';

export function useRecipeForm({
  metadataLoaded,
  onSectionChange,
  labels,
}: UseRecipeFormProps) {
  const router = useRouter();
  const t = useTranslations();

  /**
   * Local draft persistence using browser storage.
   * Prevents data loss on page refresh or accidental navigation.
   * Chosen over Redux/DB for performance (avoids high-frequency network calls)
   * and to keep the draft logic local to the recipe creation flow.
   */
  const [draft, setDraft] = useLocalStorage<DraftState | null>({
    key: DRAFT_STORAGE_KEY,
    defaultValue: null,
  });

  /* Mutation */
  const [createRecipe, { loading: publishLoading }] = useMutation(
    CREATE_RECIPE,
    {
      onCompleted: () => {
        setDraft(null);
        notifications.show({
          title: t('notifications.recipeCreatedTitle'),
          message: t('notifications.recipeCreatedMessage'),
          color: 'teal',
          icon: <IconCheck size={18} />,
        });
        router.push('/me/my-recipes');
      },
      onError: (error) => {
        notifications.show({
          title: t('notifications.recipeCreateFailedTitle'),
          message:
            error.message || t('notifications.recipeCreateFailedMessage'),
          color: 'red',
        });
      },
    },
  );

  /* Formik */
  const formik = useFormik<RecipeFormValues>({
    initialValues: draft?.values ?? {
      title: '',
      description: '',
      imgSrc: '',
      cookingTime: '',
      servings: '',
      difficultyLevel: null,
      category: null,
      labels: [],
      youtubeLink: '',
      ingredients: [],
      preparationSteps: [],
    },
    validationSchema: toFormikValidationSchema(recipeFormValidationSchema),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      if (!values.difficultyLevel || !values.category) {
        notifications.show({
          title: t('notifications.missingFieldsTitle'),
          message: t('notifications.missingFieldsMessage'),
          color: 'orange',
        });
        onSectionChange('basics');
        return;
      }

      const input = transformValuesToInput(values, labels);

      await createRecipe({
        variables: { recipeCreateInput: input },
      });
    },
  });

  /* Completion */
  const completion = computeCompletion(formik.values);
  const [debouncedValues] = useDebouncedValue(formik.values, 800);

  /* Auto-save draft */
  useEffect(() => {
    if (!metadataLoaded) return;
    setDraft({
      updatedAt: Date.now(),
      values: debouncedValues,
    });
  }, [debouncedValues, metadataLoaded, setDraft]);

  const lastSavedLabel = useMemo(() => {
    const unsaved = t('sidebar.unsaved') || 'Unsaved';
    const justSaved = t('sidebar.justSaved') || 'Just saved';
    const savedRecently = t('sidebar.savedRecently') || 'Saved recently';
    const savedAgo = t('sidebar.savedAgo') || 'Saved {minutes}m ago';

    if (!draft?.updatedAt) return unsaved;
    const delta = Date.now() - draft.updatedAt;
    if (delta < 3_000) return justSaved;
    if (delta < 60_000) return savedRecently;

    const minutes = Math.floor(delta / 60_000);
    return savedAgo.replace('{minutes}', minutes.toString());
  }, [draft?.updatedAt, t]);

  /* Actions */
  const saveDraftNow = () => {
    setDraft({
      updatedAt: Date.now(),
      values: formik.values,
    });
    notifications.show({
      message: t('notifications.draftSavedMessage'),
      color: 'blue',
      icon: <IconDeviceFloppy size={16} />,
      withBorder: true,
    });
  };

  const resetDraft = () => {
    setDraft(null);
    formik.resetForm({
      values: {
        title: '',
        description: '',
        imgSrc: '',
        cookingTime: '',
        servings: '',
        difficultyLevel: null,
        category: null,
        labels: [],
        youtubeLink: '',
        ingredients: [],
        preparationSteps: [],
      },
    });
    onSectionChange('basics');
    notifications.show({
      title: t('notifications.draftClearedTitle'),
      message: t('notifications.draftClearedMessage'),
      color: 'gray',
    });
  };

  const addIngredient = useCallback(() => {
    const newIngredient: TIngredient = {
      localId: uuidv4(),
      name: '',
      quantity: '',
      unit: '',
    };
    formik.setFieldValue('ingredients', [
      ...formik.values.ingredients,
      newIngredient,
    ]);
  }, [formik]);

  const addStep = useCallback(() => {
    const newStep: TPreparationStep = {
      localId: uuidv4(),
      description: '',
      order: formik.values.preparationSteps.length + 1,
    };
    formik.setFieldValue('preparationSteps', [
      ...formik.values.preparationSteps,
      newStep,
    ]);
  }, [formik]);

  return {
    formik,
    publishLoading,
    completion,
    lastSavedLabel,
    saveDraftNow,
    resetDraft,
    addIngredient,
    addStep,
  };
}
