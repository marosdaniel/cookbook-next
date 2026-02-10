import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useDebouncedValue, useLocalStorage } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconDeviceFloppy } from '@tabler/icons-react';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { recipeFormValidationSchema } from '@/lib/validation/validation';
import type {
  ComposerSection,
  RecipeFormValues,
  TIngredient,
  TMetadataCleaned,
  TPreparationStep,
} from '../types';
import { computeCompletion, DRAFT_STORAGE_KEY } from '../utils';

/* ─── GraphQL ─────────────────────────────────── */
const CREATE_RECIPE_MUTATION = gql`
  mutation CreateRecipe($recipeCreateInput: RecipeCreateInput!) {
    createRecipe(recipeCreateInput: $recipeCreateInput) {
      id
      title
    }
  }
`;

interface UseRecipeFormProps {
  metadataLoaded: boolean;
  onSectionChange: (section: ComposerSection) => void;
  // Metadata options needed for transforming form values on submit
  labels: TMetadataCleaned[];
}

export function useRecipeForm({
  metadataLoaded,
  onSectionChange,
  labels,
}: UseRecipeFormProps) {
  const router = useRouter();

  /* Draft persistence */
  const [draft, setDraft] = useLocalStorage<{
    updatedAt: number;
    values: RecipeFormValues;
  } | null>({
    key: DRAFT_STORAGE_KEY,
    defaultValue: null,
  });

  /* Mutation */
  const [createRecipe, { loading: publishLoading }] = useMutation(
    CREATE_RECIPE_MUTATION,
    {
      onCompleted: () => {
        setDraft(null);
        notifications.show({
          title: 'Published! 🎉',
          message: 'Your recipe is now live.',
          color: 'teal',
          icon: <IconCheck size={18} />,
        });
        router.push('/me/my-recipes');
      },
      onError: (error) => {
        notifications.show({
          title: 'Publish failed',
          message: error.message || 'Something went wrong.',
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
          title: 'Missing fields',
          message: 'Please fill in Category and Difficulty before publishing.',
          color: 'orange',
        });
        onSectionChange('basics');
        return;
      }

      const input = {
        title: values.title,
        description: values.description,
        imgSrc: values.imgSrc,
        cookingTime: Number(values.cookingTime),
        servings: Number(values.servings),
        difficultyLevel: {
          value: values.difficultyLevel.value,
          label: values.difficultyLevel.label,
        },
        category: {
          value: values.category.value,
          label: values.category.label,
        },
        labels: values.labels.map((lKey) => {
          const found = labels.find((l) => l.value === lKey);
          return found
            ? { value: found.value, label: found.label }
            : { value: lKey, label: lKey };
        }),
        youtubeLink: values.youtubeLink,
        ingredients: values.ingredients.map((i) => ({
          localId: i.localId,
          name: i.name,
          quantity: Number(i.quantity),
          unit: i.unit,
        })),
        preparationSteps: values.preparationSteps.map((s, idx) => ({
          description: s.description,
          order: s.order || idx + 1,
        })),
      };

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
    if (!draft?.updatedAt) return 'Unsaved';
    const delta = Date.now() - draft.updatedAt;
    if (delta < 3_000) return 'Just saved';
    if (delta < 60_000) return 'Saved recently';
    return `Saved ${Math.floor(delta / 60_000)}m ago`;
  }, [draft?.updatedAt]);

  /* Actions */
  const saveDraftNow = () => {
    setDraft({
      updatedAt: Date.now(),
      values: formik.values,
    });
    notifications.show({
      message: 'Draft saved locally',
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
      title: 'Draft cleared',
      message: 'Starting fresh.',
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
