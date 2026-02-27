import { useMutation } from '@apollo/client/react';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { EDIT_RECIPE } from '@/lib/graphql/mutations';
import { recipeFormValidationSchema } from '@/lib/validation/validation';
import type {
  ComposerSection,
  RecipeFormValues,
  TIngredient,
  TMetadataCleaned,
  TPreparationStep,
} from '../types';
import { computeCompletion, transformValuesToInput } from '../utils';

/* ─── Types ───────────────────────────────────── */

export interface UseRecipeEditFormProps {
  recipeId: string;
  initialValues: RecipeFormValues;
  onSectionChange: (section: ComposerSection) => void;
  labels: TMetadataCleaned[];
}

/* ─── Hook ────────────────────────────────────── */

export function useRecipeEditForm({
  recipeId,
  initialValues,
  onSectionChange,
  labels,
}: UseRecipeEditFormProps) {
  const router = useRouter();
  const translate = useTranslations();

  /* Mutation */
  const [editRecipe, { loading: submitLoading }] = useMutation(EDIT_RECIPE, {
    onCompleted: () => {
      notifications.show({
        title: translate('notifications.recipeUpdatedTitle'),
        message: translate('notifications.recipeUpdatedMessage'),
        color: 'teal',
        icon: <IconCheck size={18} />,
      });
      router.push('/me/my-recipes');
    },
    onError: (error) => {
      notifications.show({
        title: translate('notifications.recipeUpdateFailedTitle'),
        message:
          error.message || translate('notifications.recipeUpdateFailedMessage'),
        color: 'red',
      });
    },
  });

  /* Formik */
  const formik = useFormik<RecipeFormValues>({
    initialValues,
    enableReinitialize: true,
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

      await editRecipe({
        variables: { id: recipeId, recipeEditInput: input },
      });
    },
  });

  /* Stable ref so callbacks don't depend on the formik object */
  const formikRef = useRef(formik);
  formikRef.current = formik;

  /* Completion */
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

  /* Reset to original values */
  const resetToOriginal = useCallback(() => {
    formikRef.current.resetForm({ values: initialValues });
    onSectionChange('basics');
    notifications.show({
      title: translate('notifications.changesResetTitle'),
      message: translate('notifications.changesResetMessage'),
      color: 'gray',
    });
  }, [initialValues, onSectionChange, translate]);

  /* Actions */
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
    submitLoading,
    completion,
    resetToOriginal,
    addIngredient,
    addStep,
  };
}
