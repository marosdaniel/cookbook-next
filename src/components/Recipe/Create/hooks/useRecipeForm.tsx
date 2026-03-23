import { useMutation } from '@apollo/client/react';
import { useDebouncedValue, useLocalStorage } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconDeviceFloppy } from '@tabler/icons-react';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CREATE_RECIPE } from '@/lib/graphql/mutations';
import { recipeFormValidationSchema } from '@/lib/validation/validation';
import { useRecipeFormHook } from '../FormContext';
import type {
  DraftState,
  FormIngredient,
  FormPreparationStep,
  RecipeFormValues,
  UseRecipeFormProps,
} from '../types';
import {
  computeCompletion,
  DRAFT_STORAGE_KEY,
  EMPTY_FORM_VALUES,
  transformValuesToInput,
} from '../utils';

export function useRecipeForm({
  metadataLoaded,
  onSectionChange,
  labels,
}: UseRecipeFormProps) {
  const router = useRouter();
  const translate = useTranslations();

  const [draft, setDraft] = useLocalStorage<DraftState | null>({
    key: DRAFT_STORAGE_KEY,
    defaultValue: null,
  });

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

  const form = useRecipeFormHook({
    mode: 'controlled',
    initialValues: draft?.values ?? EMPTY_FORM_VALUES,
    // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between zodResolver and Mantine form values
    validate: zodResolver(recipeFormValidationSchema) as any,
    validateInputOnBlur: true,
  });

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

    await createRecipe({
      variables: { recipeCreateInput: input },
    });
  };

  const formRef = useRef(form);
  formRef.current = form;

  const completion = useMemo(
    () => computeCompletion(form.values),
    [form.values],
  );

  const [debouncedValues] = useDebouncedValue(form.values, 800);

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
      return translate('sidebar.savedAgo', { minutes });
    } catch (e) {
      console.error(e);
      return savedAgoTemplate.replace('{minutes}', minutes.toString());
    }
  }, [draft?.updatedAt, translate]);

  const saveDraftNow = useCallback(() => {
    setDraft({
      updatedAt: Date.now(),
      values: formRef.current.getValues(),
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
    formRef.current.reset();
    formRef.current.setValues(EMPTY_FORM_VALUES);
    onSectionChange('basics');
    notifications.show({
      title: translate('notifications.draftClearedTitle'),
      message: translate('notifications.draftClearedMessage'),
      color: 'gray',
    });
  }, [setDraft, onSectionChange, translate]);

  const addIngredient = useCallback(() => {
    const f = formRef.current;
    const newIngredient: FormIngredient = {
      localId: uuidv4(),
      name: '',
      quantity: '',
      unit: '',
      isOptional: false,
      note: '',
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
    publishLoading,
    completion,
    lastSavedLabel,
    saveDraftNow,
    resetDraft,
    addIngredient,
    addStep,
  };
}
