import { useMutation } from '@apollo/client/react';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { EDIT_RECIPE } from '@/lib/graphql/mutations';
import { recipeFormValidationSchema } from '@/lib/validation/validation';
import { zodResolver } from '@/lib/validation/zodResolver';
import { useRecipeFormHook } from '../FormContext';
import type {
  ComposerSection,
  FormIngredient,
  FormPreparationStep,
  MetadataOption,
  RecipeFormValues,
} from '../types';
import { computeCompletion, transformValuesToInput } from '../utils';

export interface UseRecipeEditFormProps {
  recipeId: string;
  initialValues: RecipeFormValues;
  /**
   * Stable identifier for the server version currently loaded into the form.
   * Recommended value: `${recipe.id}:${recipe.updatedAt}`.
   */
  initialValuesKey: string;
  onSectionChange: (section: ComposerSection) => void;
  labels: MetadataOption[];
}

const getNextStepOrder = (steps: FormPreparationStep[]): number => {
  const highestOrder = steps.reduce(
    (currentHighestOrder, step) => Math.max(currentHighestOrder, step.order),
    0,
  );

  return highestOrder + 1;
};

export const useRecipeEditForm = ({
  recipeId,
  initialValues,
  initialValuesKey,
  onSectionChange,
  labels,
}: UseRecipeEditFormProps) => {
  const router = useRouter();
  const translate = useTranslations();

  const [editRecipe, { loading: submitLoading }] = useMutation(EDIT_RECIPE);

  const form = useRecipeFormHook({
    mode: 'controlled',
    initialValues,
    validate: zodResolver(recipeFormValidationSchema),
    validateInputOnBlur: true,
  });

  const formRef = useRef(form);
  const hydratedValuesKeyRef = useRef<string | null>(null);

  formRef.current = form;

  /**
   * Hydrate only when a different server-side recipe version arrives.
   * Do not synchronize all initialValues reference changes: that would
   * overwrite the user while they are editing.
   */
  useEffect(() => {
    if (hydratedValuesKeyRef.current === initialValuesKey) {
      return;
    }

    form.setValues(initialValues);
    form.resetDirty(initialValues);

    hydratedValuesKeyRef.current = initialValuesKey;
  }, [form, initialValues, initialValuesKey]);

  const completion = useMemo(
    () => computeCompletion(form.values),
    [form.values],
  );

  const handlePublish = useCallback(
    async (values: RecipeFormValues) => {
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

      try {
        await editRecipe({
          variables: {
            id: recipeId,
            recipeEditInput: input,
          },
        });

        notifications.show({
          title: translate('notifications.recipeUpdatedTitle'),
          message: translate('notifications.recipeUpdatedMessage'),
          color: 'teal',
          icon: <IconCheck size={18} />,
        });

        router.push('/me/my-recipes');
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : translate('notifications.recipeUpdateFailedMessage');

        notifications.show({
          title: translate('notifications.recipeUpdateFailedTitle'),
          message,
          color: 'red',
        });
      }
    },
    [editRecipe, labels, onSectionChange, recipeId, router, translate],
  );

  const resetToOriginal = useCallback(() => {
    const currentForm = formRef.current;

    currentForm.setValues(initialValues);
    currentForm.resetDirty(initialValues);
    currentForm.resetTouched();

    onSectionChange('basics');

    notifications.show({
      title: translate('notifications.changesResetTitle'),
      message: translate('notifications.changesResetMessage'),
      color: 'gray',
    });
  }, [initialValues, onSectionChange, translate]);

  const addIngredient = useCallback(() => {
    const newIngredient: FormIngredient = {
      localId: crypto.randomUUID(),
      name: '',
      quantity: '',
      unit: '',
      isOptional: false,
      note: '',
    };

    formRef.current.insertListItem('ingredients', newIngredient);
  }, []);

  const addStep = useCallback(() => {
    const currentForm = formRef.current;
    const currentSteps = currentForm.getValues().preparationSteps;

    const newStep: FormPreparationStep = {
      localId: crypto.randomUUID(),
      description: '',
      order: getNextStepOrder(currentSteps),
    };

    currentForm.insertListItem('preparationSteps', newStep);
  }, []);

  return {
    form,
    handlePublish,
    submitLoading,
    completion,
    resetToOriginal,
    addIngredient,
    addStep,
  };
};
