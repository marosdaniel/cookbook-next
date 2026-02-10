# Add Recipe Functionality - Detailed Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture and Components](#architecture-and-components)
3. [Stepper Functionality](#stepper-functionality)
4. [Validation System](#validation-system)
5. [Metadata and Selectable Options](#metadata-and-selectable-options)
6. [Internationalization and Translations](#internationalization-and-translations)
7. [State Management](#state-management)
8. [GraphQL Operations](#graphql-operations)
9. [Form Handling and Data Flow](#form-handling-and-data-flow)

---

## Overview

The add recipe functionality allows users to create new recipes and edit existing ones through a three-step (stepper) form.

**Main Components:**

- `NewRecipePage.tsx` - Page wrapper component
- `RecipeFormEditor.tsx` - Main form component
- `GeneralsEditor.tsx` - First step: general information
- `IngredientsEditor.tsx` - Second step: ingredients
- `PreparationStepsEditor.tsx` - Third step: preparation steps

**Supported Features:**

- ✅ Create new recipe
- ✅ Edit existing recipe
- ✅ Three-step (stepper) process
- ✅ Real-time validation
- ✅ Multi-language support
- ✅ Metadata management (categories, difficulty levels, labels, units)

---

## Architecture and Components

### 1. NewRecipePage Component

**File:** `src/pages/NewRecipePage/NewRecipePage.tsx`

```tsx
const NewRecipePage = () => {
  return <RecipeFormEditor title="Start Crafting!" id="new-recipe-page" />;
};
```

**Responsibilities:**

- Simple wrapper component
- Passes necessary props to RecipeFormEditor component

---

### 2. RecipeFormEditor Component

**File:** `src/components/Recipe/RecipeFormEditor/RecipeFormEditor.tsx`

**Props interface:**

```typescript
interface IProps {
  title: string; // Form title
  id: string; // HTML id for the form
  isEditMode?: boolean; // Edit mode flag
  setIsEditMode?: React.Dispatch<React.SetStateAction<boolean>>;
}
```

**State management:**

- `active`: Current stepper step index (0-2)
- `nextStep()`: Navigate to next step
- `prevStep()`: Navigate to previous step
- `isFinalStep`: Boolean, indicates if we're at the last step

**Formik integration:**

```typescript
const { values, handleChange, handleSubmit, handleBlur, errors, touched, isSubmitting, setFieldValue } =
  useFormik<IFormikProps>({
    initialValues,
    onSubmit,
    validationSchema: recipeFormValidationSchema,
  });
```

**Main Functions:**

1. **Initialization:**

   - Load metadata (if not already loaded)
   - Initialize Formik form with initial values
   - Set edit or new mode

2. **Operations:**
   - `onSubmit()`: Save recipe (CREATE or EDIT GraphQL mutation)
   - `handleNext()`: Move to next step + save state
   - Cache update in Apollo Client

---

### 3. GeneralsEditor Component

**File:** `src/components/Recipe/RecipeFormEditor/GeneralsEditor/GeneralsEditor.tsx`

**Fields:**

1. **Title** (Required)

   - Type: `TextInput`
   - Validation: Required field
   - Placeholder: "title"

2. **Description** (Required)

   - Type: `TextInput`
   - Validation: Required field
   - Placeholder: "description"

3. **Cover Image URL**

   - Type: `TextInput`
   - Validation: URL format
   - Placeholder: "imgSrc"

4. **Servings** (Required)

   - Type: `NumberInput`
   - Min: 0, Max: 100
   - Validation: Required field

5. **Cooking Time** (Required)

   - Type: `NumberInput`
   - Unit: minutes
   - Min: 0, Max: 10000
   - Suffix: " min"

6. **Difficulty Level** (Required)

   - Type: `Select`
   - Options: Difficulty levels loaded from metadata
   - Validation: Required object structure

7. **Category** (Required)

   - Type: `Select`
   - Options: Categories loaded from metadata
   - Validation: Required object structure

8. **Labels** (Optional)

   - Type: `MultiSelect`
   - Options: Labels loaded from metadata
   - Search function: Yes
   - hidePickedOptions: Yes

9. **YouTube Link** (Optional)
   - Type: `TextInput`
   - Validation: YouTube URL format
   - Placeholder: "youtube url"

**Metadata handling:**

```typescript
const labels = useGetLabels();
const categories = useGetCategories();
const difficultyLevels = useGetLevels();
```

---

### 4. IngredientsEditor Component

**File:** `src/components/Recipe/RecipeFormEditor/IngredientsEditor/IngredientsEditor.tsx`

**Dynamic list management:**

**Ingredient structure:**

```typescript
type TIngredient = {
  localId: string; // UUID for local identification
  name: string; // Ingredient name
  quantity: number; // Quantity
  unit: string; // Unit of measurement
};
```

**Operations:**

1. **Add new ingredient:**

```typescript
const addIngredient = () => {
  const newIngredient = { ...initialIngredients[0], localId: uuidv4() };
  setFieldValue('ingredients', [...values.ingredients, newIngredient]);
};
```

2. **Delete ingredient:**

```typescript
const deleteIngredient = (index: number) => {
  const newIngredients = values.ingredients.filter((_, i) => i !== index);
  setFieldValue('ingredients', newIngredients.length > 0 ? newIngredients : []);
};
```

**UI elements for one ingredient:**

- `TextInput`: Ingredient name (required)
- `NumberInput`: Quantity (min: 0, required)
- `Select`: Unit (required, from metadata)
- `ActionIcon`: Delete button (red color, trash icon)

**Validation rule:**

```typescript
const addDisabled = isIngredientsFormValid(values);
// Disables adding new if there's an unfilled field
```

**Initialization:**

```typescript
const initialIngredients: Partial<TIngredient>[] = [{ name: '', quantity: undefined, unit: '', localId: uuidv4() }];

useEffect(() => {
  if (values.ingredients.length === 0) {
    setFieldValue('ingredients', initialIngredients);
  }
}, [values.ingredients, setFieldValue]);
```

---

### 5. PreparationStepsEditor Component

**File:** `src/components/Recipe/RecipeFormEditor/PreparationStepsEditor/PreparationStepsEditor.tsx`

**Preparation step structure:**

```typescript
type TPreparationStep = {
  description: string; // Step description
  order: number; // Step order
};
```

**Operations:**

1. **Add new step:**

```typescript
const addStep = () => {
  const newSteps = [...values.preparationSteps, { description: '', order: values.preparationSteps.length + 1 }];
  setFieldValue('preparationSteps', newSteps);
};
```

2. **Delete step:**

```typescript
const deleteStep = (index: number) => {
  const newSteps = values.preparationSteps.filter((_, i) => i !== index).map((step, i) => ({ ...step, order: i + 1 }));
  setFieldValue('preparationSteps', newSteps);
};
```

3. **Move step (up/down):**

```typescript
const moveStep = (index: number, direction: 'up' | 'down') => {
  const newSteps = [...values.preparationSteps];
  const swapIndex = direction === 'up' ? index - 1 : index + 1;

  if (swapIndex >= 0 && swapIndex < newSteps.length) {
    [newSteps[index], newSteps[swapIndex]] = [newSteps[swapIndex], newSteps[index]];
    newSteps.forEach((step, i) => (step.order = i + 1));
    setFieldValue('preparationSteps', newSteps);
  }
};
```

**UI elements for one step:**

- `Textarea`: Step description (required, autosize, min 2 rows)
- `ActionIcon`: Move up (disabled on first element)
- `ActionIcon`: Move down (disabled on last element)
- `ActionIcon`: Delete (red color, trash icon)

**Validation:**

```typescript
const isAddDisabled = values.preparationSteps.some(step => step.description.trim() === '');
// Disables adding new step if there's an empty description
```

---

## Stepper Functionality

### Mantine Stepper Component

**3 steps:**

```tsx
<Stepper active={active} onStepClick={setActive}>
  <Stepper.Step label="Generals" description="General info">
    <GeneralsEditor {...props} />
  </Stepper.Step>

  <Stepper.Step label="Ingredients" description="Add ingredients" disabled={!completedSteps.includes(0)}>
    <IngredientsEditor {...props} />
  </Stepper.Step>

  <Stepper.Step
    label="Instructions & save"
    description="Add instructions & save"
    disabled={!(completedSteps.includes(0) && completedSteps.includes(1))}
  >
    <PreparationStepsEditor {...props} />
  </Stepper.Step>

  <Stepper.Completed>
    <Center h={384}>You successfully created a recipe</Center>
  </Stepper.Completed>
</Stepper>
```

### Navigation Between Steps

**Enable next step:**

```typescript
export const nextEnabled = (values: IFormikProps, step: number) => {
  if (step === 0) {
    return !!values.title && !!values.description && !!values.servings && !!values.cookingTime;
  }
  if (step === 1) {
    return !isIngredientsFormValid(values);
  }
  if (step === 2) {
    return values.preparationSteps.length > 0;
  }
  return false;
};
```

**Completed Steps management:**

```typescript
const handleNext = () => {
  if (isFinalStep) {
    onSubmit();
    return;
  }
  dispatch(setEditRecipe({ ...values })); // Save to store
  dispatch(setCompletedSteps(active)); // Mark step as completed
  nextStep();
};
```

**Redux Store:**

```typescript
interface IRecipeState {
  editableRecipe: {
    recipe: TRecipe | TRecipeCleaned | undefined;
    completedSteps: number[]; // [0, 1, 2] - completed step indices
  };
}
```

### Navigation Buttons

```tsx
<Group justify="flex-end" mt="xl">
  <Button variant="default" onClick={prevStep} disabled={active === 0}>
    {formatMessage(generalMessages.back)}
  </Button>

  <Button
    type={isFinalStep ? 'submit' : 'button'}
    onClick={handleNext}
    loading={isSubmitting}
    loaderProps={{ type: 'dots' }}
    disabled={!nextEnabled(values, active) || isSubmitting}
  >
    {isFinalStep ? formatMessage(generalMessages.save) : 'Next'}
  </Button>
</Group>
```

**Logic:**

- **Back button:** Disabled on first step
- **Next/Save button:**
  - Steps 1-2: "Next" label, `button` type
  - Step 3: "Save" label, `submit` type
  - Disabled if step validation fails
  - Loading state during submission

---

## Validation System

### Yup Validation Schema

**File:** `src/utils/validation.ts`

```typescript
export const recipeFormValidationSchema = Yup.object().shape({
  title: Yup.string().required('Required'),

  description: Yup.string().required('Required'),

  imgSrc: Yup.string().url('Invalid url'),

  cookingTime: Yup.number().required('Required'),

  difficultyLevel: Yup.object().shape({
    key: Yup.string().required('Required'),
    name: Yup.string().required('Required'),
    label: Yup.string().required('Required'),
  }),

  category: Yup.object().shape({
    key: Yup.string().required('Required'),
    name: Yup.string().required('Required'),
    label: Yup.string().required('Required'),
  }),

  ingredients: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required('Required'),
      quantity: Yup.number().required('Required'),
      unit: Yup.string().required('Required'),
    }),
  ),

  steps: Yup.array().of(Yup.string().required('Required')),

  servings: Yup.number().required('Required'),

  youtubeLink: Yup.string()
    .url('Invalid url')
    .test(
      'is-youtube-url',
      'URL must be a valid YouTube link',
      value => !value || /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(value),
    ),
});
```

### Validation Logic

**1. Step-by-step validation:**

```typescript
// utils.tsx
export const nextEnabled = (values: IFormikProps, step: number) => {
  if (step === 0) {
    // Generals step: title, description, servings, cookingTime required
    return !!values.title && !!values.description && !!values.servings && !!values.cookingTime;
  }
  if (step === 1) {
    // Ingredients step: all ingredients filled
    return !isIngredientsFormValid(values);
  }
  if (step === 2) {
    // Preparation steps step: at least 1 step
    return values.preparationSteps.length > 0;
  }
  return false;
};
```

**2. Ingredients validation:**

```typescript
export const isIngredientsFormValid = (values: IFormikProps) => {
  return values.ingredients.some(
    ingredient => !ingredient.name || ingredient.quantity === undefined || !ingredient.unit,
  );
};
```

**3. Submission validation:**

```typescript
const onSubmit = async () => {
  if (!values.difficultyLevel || !values.category) {
    notifications.show({
      title: 'Please select difficulty level and category',
      message: 'You have to select difficulty level and category to proceed',
      color: 'red',
    });
    return;
  }
  // ... continue
};
```

### Error Messages Display

**Formik `touched` and `errors` handling:**

```tsx
<TextInput
  error={touched.title && Boolean(errors.title)}
  description={touched.title && Boolean(errors.title) ? 'Set your recipes title' : ''}
/>
```

**Mantine notifications:**

```typescript
notifications.show({
  title: 'Recipe created',
  message: 'Your recipe has been successfully created',
  color: 'green',
});
```

---

## Metadata and Selectable Options

### Metadata Types

**File:** `src/store/Metadata/types.ts`

```typescript
export enum TMetadataType {
  LEVEL = 'level', // Difficulty level
  CATEGORY = 'category', // Category
  UNIT = 'unit', // Unit of measurement
  LABEL = 'label', // Label
}

type TMetadata = {
  key: string; // Identifier (e.g.: "level-easy")
  label: string; // Display name (e.g.: "Easy")
  name: string; // Name (e.g.: "easy")
};

export type TLevelMetadata = TMetadata & {
  type: TMetadataType.LEVEL;
};

export type TCategoryMetadata = TMetadata & {
  type: TMetadataType.CATEGORY;
};

export type TUnitMetadata = TMetadata & {
  type: TMetadataType.UNIT;
};

export type TLabelMetadata = TMetadata & {
  type: TMetadataType.LABEL;
};
```

### Loading Metadata

**Hooks for retrieving metadata:**

```typescript
// src/store/Metadata/selectors.ts

export const useGetLabels = (): TMetadataCleaned[] => {
  const { formatMessage } = useIntl();
  const labels = useGetAllMetadata().filter(metadata => metadata.type === TMetadataType.LABEL);
  return cleanMetadata(labels).map(label => {
    return {
      value: label.value,
      label: formatMessage((miscMessages as MiscMessages)[label.value]),
    };
  });
};

export const useGetUnits = (): TMetadataCleaned[] => {
  const { formatMessage } = useIntl();
  const units = useGetAllMetadata().filter(metadata => metadata.type === TMetadataType.UNIT);
  return cleanMetadata(units).map(unit => {
    return {
      value: unit.value,
      label: formatMessage((miscMessages as MiscMessages)[unit.value]),
    };
  });
};

export const useGetCategories = (): TMetadataCleaned[] => {
  const { formatMessage } = useIntl();
  const categories = useGetAllMetadata().filter(metadata => metadata.type === TMetadataType.CATEGORY);
  return cleanMetadata(categories).map(category => {
    return {
      value: category.value,
      label: formatMessage((miscMessages as MiscMessages)[category.value]),
    };
  });
};

export const useGetLevels = (): TMetadataCleaned[] => {
  const { formatMessage } = useIntl();
  const levels = useGetAllMetadata().filter(metadata => metadata.type === TMetadataType.LEVEL);
  return cleanMetadata(levels).map(level => {
    return {
      value: level.value,
      label: formatMessage((miscMessages as MiscMessages)[level.value]),
    };
  });
};
```

### Available Options

#### 1. Difficulty Levels

```
- Easy (level-easy)
- Medium (level-medium)
- Hard (level-hard)
```

#### 2. Categories

```
- Breakfast (category-breakfast)
- Main Dish (category-main-dish)
- Side Dish (category-side-dish)
- Dessert (category-dessert)
- Sauce (category-sauce)
- Soup (category-soup)
- Salad (category-salad)
- Appetizer (category-appetizer)
- Bakery (category-bakery)
- Other (category-other)
```

#### 3. Units

```
- Gram (unit-gram)
- Kilogram (unit-kg)
- Liter (unit-l)
- Milliliter (unit-ml)
- Teaspoon (unit-tsp)
- Tablespoon (unit-tbsp)
- Cup (unit-cup)
- Pound (unit-lb)
- Ounce (unit-oz)
- Piece (unit-piece)
```

#### 4. Labels

```
- Vegan (label-vegan)
- Vegetarian (label-vegetarian)
- Gluten Free (label-glutenfree)
- Asian (label-asian)
- BBQ (label-bbq)
- Sugar Free (label-sugarfree)
- Smoothie (label-smoothie)
- Cocktail (label-cocktail)
- Hungarian (label-hungarian)
```

### Metadata Cleaning

**File:** `src/components/Recipe/RecipeFormEditor/utils.tsx`

```typescript
// Clean multiple metadata
export const cleanMetadata = (metadata: TAllMetadata[] | TMetadataCleaned[]): TMetadataCleaned[] => {
  return metadata.map(item => ({
    value: 'key' in item ? item.key : item.value,
    label: 'name' in item ? item.name : item.label,
  }));
};

// Clean single metadata
export const cleanSingleMetadata = (metadata: TAllMetadata | TMetadataCleaned): TMetadataCleaned => {
  return {
    value: 'key' in metadata ? metadata.key : metadata.value,
    label: 'name' in metadata ? metadata.name : metadata.label,
  };
};
```

---

## Internationalization and Translations

### Supported Languages

The project supports 4 languages:

- 🇬🇧 English (en_GB)
- 🇭🇺 Hungarian (hu_HU)
- 🇩🇪 German (de_DE)
- 🇪🇸 Spanish (es_ES)

### Translation Files

**Location:** `public/i18/`

**Structure:**

```
public/i18/
  ├── en_GB.json
  ├── hu_HU.json
  ├── de_DE.json
  └── es_ES.json
```

### Metadata Translations

**File:** `src/messages/misc.ts`

```typescript
export const miscMessages = defineMessages({
  // Units
  'unit-gram': { id: 'misc.gram', defaultMessage: 'gram' },
  'unit-kg': { id: 'misc.kg', defaultMessage: 'kilogram' },
  'unit-l': { id: 'misc.liter', defaultMessage: 'liter' },
  'unit-ml': { id: 'misc.ml', defaultMessage: 'milliliter' },
  'unit-tsp': { id: 'misc.teaspoon', defaultMessage: 'teaspoon' },
  'unit-tbsp': { id: 'misc.tablespoon', defaultMessage: 'tablespoon' },
  'unit-cup': { id: 'misc.cup', defaultMessage: 'cup' },
  'unit-lb': { id: 'misc.pound', defaultMessage: 'pound' },
  'unit-oz': { id: 'misc.ounce', defaultMessage: 'ounce' },
  'unit-piece': { id: 'misc.piece', defaultMessage: 'piece' },

  // Difficulty levels
  'level-easy': { id: 'misc.easy', defaultMessage: 'easy' },
  'level-medium': { id: 'misc.medium', defaultMessage: 'medium' },
  'level-hard': { id: 'misc.hard', defaultMessage: 'hard' },

  // Categories
  'category-breakfast': { id: 'misc.breakfast', defaultMessage: 'breakfast' },
  'category-main-dish': { id: 'misc.mainDish', defaultMessage: 'main dish' },
  'category-side-dish': { id: 'misc.sideDish', defaultMessage: 'side dish' },
  'category-dessert': { id: 'misc.dessert', defaultMessage: 'dessert' },
  'category-other': { id: 'misc.other', defaultMessage: 'other' },
  'category-sauce': { id: 'misc.sauce', defaultMessage: 'sauce' },
  'category-soup': { id: 'misc.soup', defaultMessage: 'soup' },
  'category-salad': { id: 'misc.salad', defaultMessage: 'salad' },
  'category-appetizer': { id: 'misc.appetizer', defaultMessage: 'appetizer' },
  'category-bakery': { id: 'misc.bakery', defaultMessage: 'bakery' },

  // Labels
  'label-vegan': { id: 'misc.vegan', defaultMessage: 'vegan' },
  'label-vegetarian': { id: 'misc.vegetarian', defaultMessage: 'vegetarian' },
  'label-glutenfree': { id: 'misc.glutenfree', defaultMessage: 'gluten free' },
  'label-asian': { id: 'misc.asian', defaultMessage: 'asian' },
  'label-bbq': { id: 'misc.bbq', defaultMessage: 'bbq' },
  'label-sugarfree': { id: 'misc.sugarfree', defaultMessage: 'sugar free' },
  'label-smoothie': { id: 'misc.smoothie', defaultMessage: 'smoothie' },
  'label-cocktail': { id: 'misc.cocktail', defaultMessage: 'cocktail' },
  'label-hungarian': { id: 'misc.hungarian', defaultMessage: 'hungarian' },
});
```

### JSON Translation Examples

**English (en_GB.json):**

```json
{
  "sidebar.newRecipe": "New Recipe",
  "user.recipes": "Recipes",
  "misc.gram": "gram",
  "misc.easy": "easy",
  "misc.breakfast": "breakfast",
  "misc.vegan": "vegan"
}
```

**Hungarian (hu_HU.json):**

```json
{
  "sidebar.newRecipe": "Új Recept",
  "user.recipes": "Receptek",
  "misc.gram": "gramm",
  "misc.easy": "könnyű",
  "misc.breakfast": "reggeli",
  "misc.vegan": "vegán"
}
```

**German (de_DE.json):**

```json
{
  "sidebar.newRecipe": "Neues Rezept",
  "user.recipes": "Rezepte",
  "misc.gram": "Gramm",
  "misc.easy": "einfach",
  "misc.breakfast": "Frühstück",
  "misc.vegan": "vegan"
}
```

### Using Translations in Components

```typescript
import { useIntl } from 'react-intl';

const Component = () => {
  const { formatMessage } = useIntl();

  // General messages
  const backLabel = formatMessage(generalMessages.back);

  // Metadata translation
  const labels = useGetLabels().map(label => ({
    value: label.value,
    label: formatMessage((miscMessages as MiscMessages)[label.value]),
  }));

  return <Button>{backLabel}</Button>;
};
```

---

## State Management

### Redux Store Structure

**File:** `src/store/Recipe/types.ts`

```typescript
export interface IRecipeState {
  editableRecipe: {
    recipe: TRecipe | TRecipeCleaned | undefined;
    completedSteps: number[];
  };
}
```

### Redux Actions

**File:** `src/store/Recipe/recipe.ts`

```typescript
// Save recipe for editing
export const setEditRecipe = (recipe: TRecipe | TRecipeCleaned) => {
  // Redux action
};

// Save completed steps
export const setCompletedSteps = (step: number) => {
  // Redux action
};
```

### Using Store in Components

```typescript
// RecipeFormEditor.tsx
const { editableRecipe } = useRecipeState();
const recipe = isEditMode ? editableRecipe.recipe : undefined;
const completedSteps = isEditMode ? editableRecipe.completedSteps : [];

// On next step
const handleNext = () => {
  if (isFinalStep) {
    onSubmit();
    return;
  }

  // Save to store
  dispatch(
    setEditRecipe({
      _id: recipe?._id,
      title: values.title,
      description: values.description,
      imgSrc: values.imgSrc,
      servings: values.servings,
      cookingTime: values.cookingTime,
      labels: values.labels || [],
      difficultyLevel: values.difficultyLevel!,
      category: values.category!,
      ingredients: values.ingredients,
      preparationSteps: values.preparationSteps,
      youtubeLink: values.youtubeLink,
      isFavorite: recipe?.isFavorite || false,
    }),
  );

  dispatch(setCompletedSteps(active));
  nextStep();
};
```

---

## GraphQL Operations

### CREATE_RECIPE Mutation

**File:** `src/graphql/recipe/createRecipe/createRecipe.ts`

```graphql
mutation CreateRecipe($recipeCreateInput: RecipeCreateInput) {
  createRecipe(recipeCreateInput: $recipeCreateInput) {
    _id
    title
    description
    ingredients {
      name
      quantity
      unit
    }
    category {
      name
      key
      label
    }
    labels {
      name
      key
      label
    }
    preparationSteps {
      description
      order
    }
    createdAt
    updatedAt
    createdBy
    cookingTime
    imgSrc
    servings
  }
}
```

**Usage:**

```typescript
const [createRecipe] = useMutation(CREATE_RECIPE, {
  update(cache, { data }) {
    cache.modify({
      fields: {
        getRecipes(existingRecipes = []) {
          return [...existingRecipes, data?.createRecipe];
        },
      },
    });
  },
  onCompleted: () => {
    notifications.show({
      title: 'Recipe created',
      message: 'Your recipe has been successfully created',
      color: 'green',
    });
  },
  onError: error => {
    notifications.show({
      title: 'Recipe not created',
      message: error.message,
      color: 'red',
    });
  },
});
```

### EDIT_RECIPE Mutation

```graphql
mutation Mutation($editRecipeId: ID!, $recipeEditInput: RecipeEditInput) {
  editRecipe(id: $editRecipeId, recipeEditInput: $recipeEditInput) {
    _id
    title
    description
    ingredients {
      localId
      name
      quantity
      unit
      _id
    }
    category {
      name
      key
      label
      type
      _id
    }
    labels {
      name
      key
      label
      type
      _id
    }
    preparationSteps {
      _id
      description
      order
    }
    createdAt
    updatedAt
    createdBy
    imgSrc
    cookingTime
    difficultyLevel {
      _id
      name
      key
      label
      type
    }
    servings
  }
}
```

**Usage:**

```typescript
const [editRecipe] = useMutation(EDIT_RECIPE, {
  update(cache, { data }) {
    cache.modify({
      id: cache.identify(data?.editRecipe),
      fields: {
        getRecipeById(existingRecipeRef = {}) {
          return { ...existingRecipeRef, ...data?.editRecipe };
        },
      },
    });
  },
  onCompleted: () => {
    notifications.show({
      title: 'Recipe updated',
      message: 'Your recipe has been successfully updated',
      color: 'green',
    });
  },
});
```

### Submission Process

```typescript
const onSubmit = async () => {
  // Validation
  if (!values.difficultyLevel || !values.category) {
    notifications.show({
      title: 'Please select difficulty level and category',
      message: 'You have to select difficulty level and category to proceed',
      color: 'red',
    });
    return;
  }

  // Remove __typename field
  const recipeInput: TRecipe | TNewRecipe = removeTypename({
    ...values,
    difficultyLevel: values.difficultyLevel,
    category: values.category,
    labels: values.labels,
  });

  try {
    let recipeId = recipe?._id;

    if (!isEditMode) {
      // Create new recipe
      const { data } = await createRecipe({
        variables: {
          recipeCreateInput: recipeInput,
        },
      });
      recipeId = data?.createRecipe._id;
    } else {
      // Edit existing recipe
      await editRecipe({
        variables: {
          editRecipeId: recipeId,
          recipeEditInput: recipeInput,
        },
      });
    }

    setIsEditMode?.(false);
    if (recipeId) {
      navigate(`${ENonProtectedRoutes.RECIPES}/${recipeId}`);
    } else {
      navigate(ENonProtectedRoutes.RECIPES);
    }
  } catch (_error) {
    console.log((_error as Error).message);
  }
};
```

### \_\_typename Removal

GraphQL automatically adds a `__typename` field to every object. This must be removed before submission:

```typescript
export const removeTypename = (value: any): any => {
  if (Array.isArray(value)) {
    return value.map(v => removeTypename(v));
  } else if (typeof value === 'object' && value !== null) {
    const { __typename, ...rest } = value as TRemoveTypeObject;
    return Object.keys(rest).reduce((acc, key) => {
      acc[key] = removeTypename(rest[key]);
      return acc;
    }, {} as TRemoveTypeObject);
  }
  return value;
};
```

---

## Form Handling and Data Flow

### Formik Initialization

```typescript
const initialValues = {
  title: recipe?.title ?? '',
  description: recipe?.description ?? '',
  imgSrc: recipe?.imgSrc ?? '',
  servings: recipe?.servings ?? 1,
  cookingTime: recipe?.cookingTime ?? 0,
  difficultyLevel: recipe?.difficultyLevel ? cleanSingleMetadata(recipe?.difficultyLevel) : undefined,
  category: recipe?.category ? cleanSingleMetadata(recipe?.category) : undefined,
  labels: recipe?.labels ? cleanMetadata(recipe?.labels) : [],
  youtubeLink: recipe?.youtubeLink ?? '',
  ingredients: recipe?.ingredients ?? [],
  preparationSteps: recipe?.preparationSteps ?? [],
};

const formik = useFormik<IFormikProps>({
  initialValues,
  onSubmit,
  validationSchema: recipeFormValidationSchema,
});
```

### Field Handling

**Text fields:**

```tsx
<TextInput
  id="title"
  name="title"
  value={values.title}
  onChange={handleChange}
  onBlur={handleBlur}
  error={touched.title && Boolean(errors.title)}
/>
```

**Number fields:**

```tsx
<NumberInput
  id="servings"
  name="servings"
  value={values.servings}
  onChange={value => setFieldValue('servings', value)}
  onBlur={handleBlur}
/>
```

**Select fields:**

```tsx
<Select
  name="difficultyLevel"
  value={values.difficultyLevel?.value ?? ''}
  onChange={value => {
    const selectedLevel = difficultyLevels.find(level => level.value === value);
    setFieldValue('difficultyLevel', selectedLevel);
  }}
  onBlur={handleBlur}
  data={difficultyLevels}
/>
```

**MultiSelect:**

```tsx
<MultiSelect
  data={labels}
  value={values.labels?.map(label => label.value)}
  onChange={selectedValues => {
    const selectedObjects = selectedValues.map(value => labels.find(item => item.value === value));
    setFieldValue('labels', selectedObjects.filter(Boolean));
  }}
/>
```

### Dynamic Lists

**Ingredients example:**

```tsx
{
  values.ingredients.map((ingredient, index) => (
    <Group key={ingredient.localId || index}>
      <TextInput name={`ingredients[${index}].name`} value={ingredient.name} onChange={handleChange} />
      <NumberInput
        name={`ingredients[${index}].quantity`}
        value={ingredient.quantity}
        onChange={value => setFieldValue(`ingredients[${index}].quantity`, value)}
      />
      <Select
        name={`ingredients[${index}].unit`}
        value={ingredient.unit}
        onChange={value => setFieldValue(`ingredients[${index}].unit`, value ?? '')}
        data={units}
      />
      <ActionIcon onClick={() => deleteIngredient(index)}>
        <FaTrash />
      </ActionIcon>
    </Group>
  ));
}
```

---

## Summary

### Main Features

1. **3-step stepper process:**

   - General information
   - Ingredients
   - Preparation steps

2. **Validation system:**

   - Yup schema
   - Step-by-step validation
   - Real-time error messages

3. **Metadata management:**

   - 4 types: difficulty, category, unit, label
   - Translated UI elements
   - Stored in Redux store

4. **Internationalization:**

   - 4 language support
   - React-intl integration
   - JSON-based translations

5. **GraphQL operations:**

   - CREATE_RECIPE mutation
   - EDIT_RECIPE mutation
   - Apollo cache update

6. **State management:**
   - Redux store
   - Completed steps tracking
   - Editable recipe storage

### Data Flow

```
User → Formik → Validation → Redux Store → GraphQL → Backend
  ↓                                                      ↓
UI Update ← Apollo Cache ← GraphQL Response ← Backend Response
```

### Next Steps (Optional Improvements)

- [ ] Image upload functionality (currently URL only)
- [ ] Preview function before saving
- [ ] Recipe duplication
- [ ] Auto-save functionality
- [ ] Recipe import/export
- [ ] Nutrition calculator (calories, protein, etc.)
- [ ] AI-based recipe suggestions
