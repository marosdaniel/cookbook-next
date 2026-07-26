import { useMutation } from '@apollo/client/react';
import { useDebouncedValue } from '@mantine/hooks';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CREATE_RECIPE } from '@/lib/graphql/mutations';
import { recipeFormValidationSchema } from '@/lib/validation/validation';
import { zodResolver } from '@/lib/validation/zodResolver';

import {
  showErrorNotification,
  showInfoNotification,
  showNeutralNotification,
  showSuccessNotification,
  showWarningNotification,
} from '@/utils/notifications';
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

const AUTOSAVE_DELAY_MS = 1_000;
const LAST_SAVED_REFRESH_MS = 15_000;

const getNextStepOrder = (steps: FormPreparationStep[]): number => {
  const highestOrder = steps.reduce(
    (currentHighestOrder, step) => Math.max(currentHighestOrder, step.order),
    0,
  );

  return highestOrder + 1;
};

export const useRecipeForm = ({
  metadataLoaded,
  onSectionChange,
  labels,
}: UseRecipeFormProps) => {
  const router = useRouter();
  const translate = useTranslations();

  
  const [draft, setDraftState] = useState<DraftState | null>(null);
  
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDraftState(parsed);
        form.setValues(parsed.values);
        form.resetDirty(parsed.values);
      }
    } catch (e) {
      // console.error(e)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDraft = useCallback((nextDraft: DraftState | null) => {
    setDraftState(nextDraft);
    if (!nextDraft) {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } else {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(nextDraft));
    }
  }, []);


  const [now, setNow] = useState(() => Date.now());

  const [createRecipe, { loading: publishLoading }] = useMutation(
    CREATE_RECIPE,
    {
      onCompleted: () => {
        setDraft(null);

        showSuccessNotification(
          translate('notifications.recipeCreatedTitle'),
          translate('notifications.recipeCreatedMessage'),
        );

        router.push('/me/my-recipes');
      },
      onError: (error) => {
        showErrorNotification(
          translate('notifications.recipeCreateFailedTitle'),
          error.message || translate('notifications.recipeCreateFailedMessage'),
          error,
        );
      },
    },
  );

  
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const form = useRecipeFormHook({
    mode: 'controlled',
    initialValues: EMPTY_FORM_VALUES,
    validate: zodResolver(recipeFormValidationSchema, (key) => translate(key)),
    validateInputOnBlur: true,
  });

  const formRef = useRef(form);
  

  formRef.current = form;

  

  const completion = useMemo(
    () => computeCompletion(form.values),
    [form.values],
  );

  const [debouncedValues, cancelDebouncedDraftSave] = useDebouncedValue(
    form.values,
    AUTOSAVE_DELAY_MS,
  );

  useEffect(() => {
    if (!metadataLoaded || !form.isDirty() || JSON.stringify(draft?.values) === JSON.stringify(debouncedValues)) {
      return;
    }

    setDraft({
      updatedAt: Date.now(),
      values: debouncedValues,
    });
  }, [debouncedValues, draft?.values, form, metadataLoaded, setDraft]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, LAST_SAVED_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const handlePublish = useCallback(
    async (values: RecipeFormValues) => {
      if (!values.difficultyLevel || !values.category) {
        showWarningNotification(
          translate('notifications.missingFieldsTitle'),
          translate('notifications.missingFieldsMessage'),
        );

        onSectionChange('basics');
        return;
      }

      const input = transformValuesToInput(values, labels);

      await createRecipe({
        variables: {
          recipeCreateInput: input,
        },
      });
    },
    [createRecipe, labels, onSectionChange, translate],
  );

  const lastSavedLabel = useMemo(() => {
    if (!draft?.updatedAt) {
      return translate('sidebar.unsaved');
    }

    const elapsedMilliseconds = Math.max(0, now - draft.updatedAt);

    if (elapsedMilliseconds < 3_000) {
      return translate('sidebar.justSaved');
    }

    if (elapsedMilliseconds < 60_000) {
      return translate('sidebar.savedRecently');
    }

    return translate('sidebar.savedAgo', {
      minutes: Math.floor(elapsedMilliseconds / 60_000),
    });
  }, [draft?.updatedAt, now, translate]);

  const saveDraftNow = useCallback(() => {
    cancelDebouncedDraftSave();

    setDraft({
      updatedAt: Date.now(),
      values: formRef.current.getValues(),
    });

    showInfoNotification(translate('notifications.draftSavedMessage'), {
      icon: <IconDeviceFloppy size={16} />,
      withBorder: true,
    });
  }, [cancelDebouncedDraftSave, setDraft, translate]);

  const resetDraft = useCallback(() => {
    const currentForm = formRef.current;

    cancelDebouncedDraftSave();

    setDraft(null);

    currentForm.setValues(EMPTY_FORM_VALUES);
    currentForm.resetDirty(EMPTY_FORM_VALUES);

    onSectionChange('basics');

    showNeutralNotification(
      translate('notifications.draftClearedTitle'),
      translate('notifications.draftClearedMessage'),
    );
  }, [cancelDebouncedDraftSave, onSectionChange, setDraft, translate]);

  const addIngredient = useCallback(() => {
    const currentForm = formRef.current;

    const newIngredient: FormIngredient = {
      localId: crypto.randomUUID(),
      name: '',
      quantity: '',
      unit: '',
      isOptional: false,
      note: '',
    };

    currentForm.insertListItem('ingredients', newIngredient);
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
    publishLoading,
    completion,
    lastSavedLabel,
    saveDraftNow,
    resetDraft,
    addIngredient,
    addStep,
  };
};
