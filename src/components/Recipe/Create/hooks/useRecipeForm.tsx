import { useMutation } from '@apollo/client/react';
import { useDebouncedValue, useLocalStorage } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconDeviceFloppy } from '@tabler/icons-react';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef } from 'react';
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
  const translate = useTranslations();

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
          title: translate('notifications.recipeCreatedTitle'),
          message: translate('notifications.recipeCreatedMessage'),
          color: 'teal',
          icon: <IconCheck size={18} />,
        });
        router.push('/me/my-recipes');
      },
      onError: (error) => {
        notifications.show({
          title: translate('notifications.recipeCreateFailedTitle'),
          message:
            error.message ||
            translate('notifications.recipeCreateFailedMessage'),
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
          title: translate('notifications.missingFieldsTitle'),
          message: translate('notifications.missingFieldsMessage'),
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

  /* Stable ref so callbacks don't depend on the formik object */
  const formikRef = useRef(formik);
  formikRef.current = formik;

  /* Completion – only recompute when meaningful fields change */
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional granular deps for perf
  const completion = useMemo(
    () => computeCompletion(formik.values),
    [
      formik.values.title,
      formik.values.description,
      formik.values.cookingTime,
      formik.values.servings,
      formik.values.category,
      formik.values.difficultyLevel,
      formik.values.ingredients.length,
      formik.values.preparationSteps.length,
    ],
  );
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
    const unsaved = translate('sidebar.unsaved') || 'Unsaved';
    const justSaved = translate('sidebar.justSaved') || 'Just saved';
    const savedRecently =
      translate('sidebar.savedRecently') || 'Saved recently';
    const savedAgoTemplate = 'Saved {minutes}m ago';

    if (!draft?.updatedAt) return unsaved;
    const delta = Date.now() - draft.updatedAt;
    if (delta < 3_000) return justSaved;
    if (delta < 60_000) return savedRecently;

    const minutes = Math.floor(delta / 60_000);
    try {
      // Provide the required formatting variable when calling the translator.
      return translate('sidebar.savedAgo', { minutes });
    } catch (e) {
      console.error(e);
      return savedAgoTemplate.replace('{minutes}', minutes.toString());
    }
  }, [draft?.updatedAt, translate]);

  /* Actions */
  const saveDraftNow = useCallback(() => {
    setDraft({
      updatedAt: Date.now(),
      values: formikRef.current.values,
    });
    notifications.show({
      message: translate('notifications.draftSavedMessage'),
      color: 'blue',
      icon: <IconDeviceFloppy size={16} />,
      withBorder: true,
    });
  }, [setDraft, translate]);

  const resetDraft = useCallback(() => {
    setDraft(null);
    formikRef.current.resetForm({
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
      title: translate('notifications.draftClearedTitle'),
      message: translate('notifications.draftClearedMessage'),
      color: 'gray',
    });
  }, [setDraft, onSectionChange, translate]);

  const addIngredient = useCallback(() => {
    const f = formikRef.current;
    const newIngredient: TIngredient = {
      localId: uuidv4(),
      name: '',
      quantity: '',
      unit: '',
    };
    f.setFieldValue('ingredients', [...f.values.ingredients, newIngredient]);
  }, []);

  const addStep = useCallback(() => {
    const f = formikRef.current;
    const newStep: TPreparationStep = {
      localId: uuidv4(),
      description: '',
      order: f.values.preparationSteps.length + 1,
    };
    f.setFieldValue('preparationSteps', [
      ...f.values.preparationSteps,
      newStep,
    ]);
  }, []);

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
