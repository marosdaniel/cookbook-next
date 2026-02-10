# Add Recipe Functionality - Detailed Documentation

## Overview

The add-recipe (createRecipe) functionality allows authenticated users to create new recipes in the system. This is a GraphQL mutation with comprehensive validation, authentication, and database relationships.

---

## 1. GraphQL Schema Definition

**File:** [server/graphql/schema/recipe.graphql](../server/graphql/schema/recipe.graphql)

### Mutation Definition

```graphql
type Mutation {
  createRecipe(recipeCreateInput: RecipeCreateInput): Recipe!
}
```

### Input Type: RecipeCreateInput

```graphql
input RecipeCreateInput {
  title: String! # Required - Recipe title
  description: String # Optional - Recipe description
  ingredients: [IngredientInput]! # Required - List of ingredients
  preparationSteps: [PreparationStepInput]! # Required - Preparation steps
  category: MetaInputPartial! # Required - Category (e.g., dessert, main course)
  labels: [MetaInputPartial] # Optional - Labels (e.g., gluten-free, vegan)
  imgSrc: String # Optional - Image URL
  cookingTime: Int! # Required - Cooking time in minutes
  difficultyLevel: MetaInputPartial! # Required - Difficulty level
  servings: Int! # Required - Number of servings
  youtubeLink: String # Optional - YouTube video link
}
```

### Input Type: IngredientInput

```graphql
input IngredientInput {
  _id: ID # Optional - MongoDB ObjectId
  localId: String! # Required - Client-side identifier
  name: String! # Required - Ingredient name
  quantity: Float! # Required - Quantity
  unit: String! # Required - Unit of measure
}
```

### Input Type: PreparationStepInput

```graphql
input PreparationStepInput {
  _id: ID # Optional - MongoDB ObjectId
  description: String! # Required - Step description
  order: Int! # Required - Order/sequence
}
```

### Input Type: MetaInputPartial

```graphql
input MetaInputPartial {
  value: String! # The metadata key value
  label: String! # The display label
}
```

### Return Type: Recipe

```graphql
type Recipe {
  _id: ID!
  title: String!
  description: String
  ingredients: [Ingredient]!
  category: Category!
  labels: [Label]!
  preparationSteps: [PreparationStep]!
  createdAt: DateTime!
  updatedAt: DateTime!
  createdBy: String! # The creator user's userName
  imgSrc: String
  cookingTime: Int!
  difficultyLevel: DifficultyLevel!
  servings: Int!
  youtubeLink: String
  averageRating: Float! # Average rating (initially 0)
  ratingsCount: Int! # Number of ratings (initially 0)
  userRating: Float # Current user's rating
  isFavorite: Boolean # Whether it's a favorite for the current user
}
```

---

## 2. TypeScript Interface Definitions

**File:** [server/graphql/resolvers/recipe/mutations/types.ts](../server/graphql/resolvers/recipe/mutations/types.ts)

```typescript
interface IRecipeInput {
  title: string;
  description: string;
  ingredients: any[];
  preparationSteps: any[];
  category: { value: string };
  imgSrc: string;
  labels: { value: string }[];
  cookingTime: number;
  difficultyLevel: { value: string };
  servings: number;
  youtubeLink: string;
}

export interface ICreateRecipe {
  recipeCreateInput: IRecipeInput;
}
```

---

## 3. Mongoose Model Definition

**File:** [server/graphql/models/Recipe.ts](../server/graphql/models/Recipe.ts)

### Recipe Interface

```typescript
export interface IRecipe {
  id: string;
  title: string;
  description?: string;
  preparationSteps: IPreparationStep[];
  ingredients: IIngredient[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  author: { type: typeof Schema.Types.ObjectId; ref: string };
  category: TCategory;
  imgSrc?: string;
  cookingTime: number;
  difficultyLevel: TDifficultyLevel;
  labels?: TLabel[];
  servings: number;
  youtubeLink?: string;
  isFavorite?: boolean;
  averageRating: number;
  ratingsCount: number;
}
```

### Ingredient Interface

```typescript
export interface IIngredient {
  _id: ObjectId;
  localId: string; // Client-side identifier
  name: string;
  quantity: number;
  unit: string;
}
```

### PreparationStep Interface

```typescript
export interface IPreparationStep {
  _id: ObjectId;
  description: string;
  order: number;
}
```

### Mongoose Schema

```typescript
const recipeSchema = new Schema<IRecipe>({
  id: String,
  title: { type: String, required: true },
  description: String,
  preparationSteps: [preparationStepSchema],
  ingredients: [ingredientSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  category: categorySchema,
  imgSrc: String,
  cookingTime: { type: Number, required: true },
  difficultyLevel: difficultyLevelSchema,
  labels: [labelSchema],
  servings: { type: Number, default: 1 },
  youtubeLink: String,
  averageRating: { type: Number, default: 0.0 },
  ratingsCount: { type: Number, default: 0 },
});

// Pre-save hook: automatically updates the updatedAt field
recipeSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});
```

---

## 4. Resolver Implementation

**File:** [server/graphql/resolvers/recipe/mutations/createRecipe.ts](../server/graphql/resolvers/recipe/mutations/createRecipe.ts)

### Main Steps

```typescript
export const createRecipe = async (_: any, { recipeCreateInput }: ICreateRecipe, context: IContext) => {
  // 1. AUTHENTICATION
  if (!context || !context._id) {
    throwCustomError('Unauthenticated operation - no user found', ErrorTypes.UNAUTHENTICATED);
  }

  // 2. VALIDATION
  if (
    !title ||
    !description ||
    !ingredients ||
    !preparationSteps ||
    !category ||
    !cookingTime ||
    !difficultyLevel ||
    !servings
  ) {
    throwCustomError('All fields are required', ErrorTypes.BAD_REQUEST);
  }

  try {
    // 3. FETCH USER
    const user = await User.findById(context._id);
    if (!user) {
      throwCustomError('User not found', ErrorTypes.UNAUTHENTICATED);
    }

    // 4. FETCH METADATA FROM DATABASE
    const labelsFromDb = await Metadata.find({
      key: { $in: labels.map(label => label.value) },
    });
    const categoryFromDb = await Metadata.findOne({ key: category.value });
    const difficultyLevelFromDb = await Metadata.findOne({ key: difficultyLevel.value });

    if (!categoryFromDb || !difficultyLevelFromDb) {
      throwCustomError('Invalid category or difficulty level', ErrorTypes.BAD_REQUEST);
    }

    // 5. CREATE NEW RECIPE
    const newRecipe = new Recipe({
      title,
      description,
      ingredients,
      preparationSteps,
      createdBy: user.userName,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: categoryFromDb,
      imgSrc,
      labels: labelsFromDb,
      cookingTime,
      difficultyLevel: difficultyLevelFromDb,
      servings,
      youtubeLink,
      averageRating: 0.0,
      ratingsCount: 0,
    });

    // 6. SAVE RECIPE
    const res = await newRecipe.save();

    // 7. UPDATE USER'S RECIPES ARRAY
    user.recipes.push(res._id);
    await user.save();

    // 8. RETURN THE NEW RECIPE
    return res;
  } catch (error) {
    throwCustomError('Failed to create recipe', ErrorTypes.INTERNAL_SERVER_ERROR);
  }
};
```

---

## 5. Authentication and Context

**File:** [server/context/index.ts](../server/context/index.ts)

### How Context Works

```typescript
const context = async ({ req }) => {
  const { operationName, query } = req.body;
  const parsedQuery = parse(query);
  const operationDefinition = firstFieldValueNameFromOperation(firstOperationDefinition(parsedQuery));

  // No user required for introspection queries
  if (operationName === 'IntrospectionQuery') {
    return {};
  }

  const userTokenNotRequired = operationsConfig.publicOperations.includes(operationDefinition);

  const token = req.headers.authorization || '';

  // For public operations, optionally load the user
  if (userTokenNotRequired) {
    if (token) {
      const user = await getUser(token, operationDefinition);
      return user ? { _id: user._id, ...user } : {};
    } else {
      return {};
    }
  }

  // User is required for private operations
  const user = await getUser(token, operationDefinition);

  if (!user) {
    return {};
  }

  return { _id: user._id, ...user };
};
```

### Context Interface

**File:** [server/context/types.ts](../server/context/types.ts)

```typescript
export interface IContext {
  _id?: string; // MongoDB ObjectId
  role?: string; // USER, ADMIN, BLOGGER
  userName?: string;
  email?: string;
  locale?: string;
  firstName?: string;
  lastName?: string;
}
```

---

## 6. Metadata System

**File:** [server/graphql/models/Metadata.ts](../server/graphql/models/Metadata.ts)

Metadata is a central table for storing categories, difficulty levels, labels, and units of measure.

```typescript
export type TMetadataType = 'level' | 'category' | 'unit' | 'label';

export interface IMetadata {
  key: string; // Unique key (e.g., 'dessert', 'easy', 'vegan')
  label: string; // Display name (e.g., 'Dessert', 'Easy', 'Vegan')
  type: TMetadataType;
  name: string;
}
```

### Metadata Types

- **category**: Recipe categories (main course, dessert, soup, etc.)
- **level**: Difficulty levels (easy, medium, hard)
- **label**: Labels (vegan, gluten-free, quick, etc.)
- **unit**: Units of measure (g, kg, ml, dl, etc.)

---

## 7. User Model Relationship

**File:** [server/graphql/models/User.ts](../server/graphql/models/User.ts)

```typescript
const userSchema = new Schema<IUser>({
  // ... other fields
  recipes: [{ type: Schema.Types.ObjectId, ref: 'Recipe', default: [] }],
  favoriteRecipes: [{ type: Schema.Types.ObjectId, ref: 'Recipe', default: [] }],
});
```

When a new recipe is created:

1. The recipe is saved to the `Recipe` collection
2. The recipe's `_id` is added to the creator user's `recipes` array
3. This enables easy querying of all recipes by a user

---

## 8. Resolver Registration

**File:** [server/graphql/resolvers/recipes.ts](../server/graphql/resolvers/recipes.ts)

```typescript
import { createRecipe } from './recipe';

const recipeResolvers = {
  Query: {
    getRecipeById,
    getRecipesByTitle,
    getRecipes,
    getRecipesByUserName,
    getRecipesByUserId,
    getFavoriteRecipes,
  },
  Mutation: {
    createRecipe, // <-- Registered here
    editRecipe,
    deleteRecipe,
    deleteAllRecipes,
  },
};

export default recipeResolvers;
```

---

## 9. Error Handling

**File:** [server/helpers/error-handler.helper.ts](../server/helpers/error-handler.helper.ts)

### Error Types

```typescript
export enum ErrorTypes {
  UNAUTHENTICATED = 'UNAUTHENTICATED', // Not logged in
  BAD_REQUEST = 'BAD_REQUEST', // Invalid input
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR', // Server error
}
```

### Possible Errors

1. **Authentication Error**: No context or `_id` in context
   - Error message: "Unauthenticated operation - no user found"
   - HTTP status: 401

2. **Validation Error**: Missing required fields
   - Error message: "All fields are required"
   - HTTP status: 400

3. **User Not Found**: The context `_id` does not exist in the database
   - Error message: "User not found"
   - HTTP status: 401

4. **Invalid Metadata**: Category or difficultyLevel does not exist
   - Error message: "Invalid category or difficulty level"
   - HTTP status: 400

5. **Save Error**: Database error during save
   - Error message: "Failed to create recipe"
   - HTTP status: 500

---

## 10. Data Flow Diagram

```
Client Request (GraphQL Mutation)
         ↓
Authorization Header (JWT Token)
         ↓
Context Middleware
   ├─→ Parse Query
   ├─→ Extract Token
   ├─→ Validate Token
   └─→ Get User from DB
         ↓
createRecipe Resolver
   ├─→ Validate Context
   ├─→ Validate Required Fields
   ├─→ Find User by ID
   ├─→ Fetch Metadata (category, labels, difficultyLevel)
   ├─→ Create New Recipe Object
   ├─→ Save Recipe to DB
   ├─→ Update User's recipes Array
   ├─→ Save User to DB
   └─→ Return Recipe
         ↓
GraphQL Response (Recipe Object)
         ↓
Client
```

---

## 11. Example GraphQL Mutation

### Request

```graphql
mutation CreateRecipe($input: RecipeCreateInput!) {
  createRecipe(recipeCreateInput: $input) {
    _id
    title
    description
    ingredients {
      _id
      name
      quantity
      unit
    }
    preparationSteps {
      _id
      description
      order
    }
    category {
      _id
      name
      label
    }
    labels {
      _id
      name
      label
    }
    cookingTime
    difficultyLevel {
      _id
      name
      label
    }
    servings
    imgSrc
    youtubeLink
    createdBy
    createdAt
    updatedAt
    averageRating
    ratingsCount
  }
}
```

### Variables

```json
{
  "input": {
    "title": "Pumpkin Soup",
    "description": "Delicious, creamy pumpkin soup with ginger",
    "ingredients": [
      {
        "localId": "ing-1",
        "name": "Pumpkin",
        "quantity": 500,
        "unit": "g"
      },
      {
        "localId": "ing-2",
        "name": "Onion",
        "quantity": 1,
        "unit": "pc"
      },
      {
        "localId": "ing-3",
        "name": "Garlic",
        "quantity": 2,
        "unit": "cloves"
      },
      {
        "localId": "ing-4",
        "name": "Vegetable broth",
        "quantity": 500,
        "unit": "ml"
      }
    ],
    "preparationSteps": [
      {
        "description": "Peel the pumpkin and cut it into cubes.",
        "order": 1
      },
      {
        "description": "Chop the onion and garlic finely and sauté in oil.",
        "order": 2
      },
      {
        "description": "Add the pumpkin and broth, then cook until soft.",
        "order": 3
      },
      {
        "description": "Blend until creamy with an immersion blender, and season with salt and pepper.",
        "order": 4
      }
    ],
    "category": {
      "value": "soup",
      "label": "Soup"
    },
    "labels": [
      {
        "value": "vegetarian",
        "label": "Vegetarian"
      },
      {
        "value": "healthy",
        "label": "Healthy"
      }
    ],
    "cookingTime": 30,
    "difficultyLevel": {
      "value": "easy",
      "label": "Easy"
    },
    "servings": 4,
    "imgSrc": "https://example.com/pumpkin-soup.jpg",
    "youtubeLink": "https://youtube.com/watch?v=example"
  }
}
```

### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## 12. Important Notes

### 1. Metadata Prerequisites

For `createRecipe` to work, the following metadata must exist in the database:

- The specified `category.value` key
- The specified `difficultyLevel.value` key
- The specified `labels[].value` keys (optional, but must exist if provided)

### 2. Automatic Fields

The following fields are automatically set:

- `createdAt`: Current timestamp
- `updatedAt`: Current timestamp
- `createdBy`: User's `userName` from context
- `averageRating`: 0.0
- `ratingsCount`: 0

### 3. Ingredients and PreparationSteps

These are embedded documents in the recipe:

- Automatically receive `_id` from Mongoose
- The `localId` is a client-side identifier (for UI handling)
- The `preparationSteps` `order` field determines the sequence

### 4. Relationships

- **Recipe → User**: `createdBy` (string, userName) and `author` (ObjectId reference)
- **User → Recipe**: `recipes` array (ObjectId references)
- **Recipe → Metadata**: Embedded objects (not references)

### 5. Pre-save Hook

The Recipe model's `pre-save` hook automatically updates the `updatedAt` field before every save.

---

## 13. Testing Considerations

### Unit Tests

1. **Authentication**:
   - Call without context → UNAUTHENTICATED error
   - Invalid user ID → User not found error

2. **Validation**:
   - Missing required fields → BAD_REQUEST error
   - Invalid metadata → BAD_REQUEST error

3. **Successful Creation**:
   - With all required fields → Successful save
   - Recipe ID is added to user
   - Default values correctly set

### Integration Tests

1. Testing GraphQL endpoint
2. Database connection verification
3. Context middleware functionality
4. Metadata queries

---

## 14. Optimization Opportunities

### Current Implementation Weaknesses

1. **Metadata Queries**: Separate queries for category, difficultyLevel, and labels
   - **Fix**: Single aggregated query

2. **Error Handling**: The catch block swallows specific errors
   - **Fix**: More detailed error reporting and logging

3. **Missing Transaction**: If user.save() fails, orphan recipe remains
   - **Fix**: Use MongoDB transactions

### Suggested Improvements

```typescript
// Example of using transactions
const session = await mongoose.startSession();
session.startTransaction();

try {
  const res = await newRecipe.save({ session });
  user.recipes.push(res._id);
  await user.save({ session });

  await session.commitTransaction();
  return res;
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

---

## Summary

The `createRecipe` mutation is a well-structured, secure GraphQL operation that:

✅ **Applies authentication** (JWT token-based)  
✅ **Validates** input data  
✅ **Uses a metadata system** for managing categories, labels, and difficulty levels  
✅ **Maintains relationships** between User and Recipe models  
✅ **Provides error handling** for various error cases  
✅ **Manages automatic timestamps** (createdAt, updatedAt)

The system is scalable and easily extensible with new features.
