import { useMutation } from '@apollo/client/react';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EDIT_RECIPE } from '@/lib/graphql/mutations';
import { recipeFormValidationSchema } from '@/lib/validation/validation';
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
  onSectionChange: (section: ComposerSection) => void;
  labels: MetadataOption[];
}

export function useRecipeEditForm({
  recipeId,
  initialValues,
  onSectionChange,
  labels,
}: UseRecipeEditFormProps) {
  const router = useRouter();
  const translate = useTranslations();

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

  const form = useRecipeFormHook({
    mode: 'controlled',
    initialValues,
    // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between zodResolver and Mantine form values
    validate: zodResolver(recipeFormValidationSchema) as any,
    validateInputOnBlur: true,
  });

  // Since it's uncontrolled, to handle initial values loading async, we use `useEffect`
  useEffect(() => {
    form.setValues(initialValues);
    form.resetDirty(initialValues);
  }, [initialValues, form]);

  const handlePublish = async (values: RecipeFormValues) => {
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
  };

  const formRef = useRef(form);
  formRef.current = form;

  const completion = useMemo(
    () => computeCompletion(form.values),
    [form.values],
  );

  const resetToOriginal = useCallback(() => {
    formRef.current.reset();
    formRef.current.setValues(initialValues);
    onSectionChange('basics');
    notifications.show({
      title: translate('notifications.changesResetTitle'),
      message: translate('notifications.changesResetMessage'),
      color: 'gray',
    });
  }, [initialValues, onSectionChange, translate]);

  const addIngredient = useCallback(() => {
    const f = formRef.current;
    const newIngredient: FormIngredient = {
      localId: uuidv4(),
      name: '',
      quantity: '',
      unit: '',
    };
    f.insertListItem('ingredients', newIngredient);
  }, []);

  const addStep = useCallback(() => {
    const f = formRef.current;
    const newStep: FormPreparationStep = {
      localId: uuidv4(),
      description: '',
      order: f.getValues().preparationSteps.length + 1,
    };
    f.insertListItem('preparationSteps', newStep);
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
}
