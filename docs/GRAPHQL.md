# GraphQL & Code Generation

This document explains the GraphQL architecture, code generation workflow, security features, and best practices for working with the Cookbook API.

## Table of Contents

1. [Overview](#overview)
2. [Schema Structure](#schema-structure)
3. [Code Generation Workflow](#code-generation-workflow)
4. [Security Architecture](#security-architecture)
5. [Working with GraphQL](#working-with-graphql)
6. [Common Workflows](#common-workflows)

---

## Overview

The Cookbook API uses **Apollo Server 5** with a modular GraphQL schema and **GraphQL Code Generator** for type-safe client operations. The architecture enforces security through:

- **Persisted queries** (SHA-256 allowlist) to prevent injection attacks
- **Field-level authorization** to control access to sensitive user fields
- **Declarative policies** that scale without hardcoded auth logic
- **Type-safe codegen** to eliminate manual type duplication

---

## Schema Structure

### SDL Organization

GraphQL SDL is defined in separate `.graphql` files, organized by domain:

```
src/lib/graphql/typeDefs/
├── user.graphql          # User type, queries, mutations
├── recipe.graphql        # Recipe type, queries, mutations
├── metadata.graphql      # Metadata queries
└── common.graphql        # Scalars and shared types
```

### Building the Schema

The schema is assembled at runtime in [`src/app/api/graphql/route.ts`](../src/app/api/graphql/route.ts):

```typescript
const userTypeDefs = require('./typeDefs/user.graphql');
const recipeTypeDefs = require('./typeDefs/recipe.graphql');
// ... etc

const typeDefs = [userTypeDefs, recipeTypeDefs, ...];
```

### Resolver Organization

Resolvers follow a modular structure:

```
src/lib/graphql/resolvers/
├── user/
│   ├── queries/         # getUserById, getFavoriteRecipes, getFollowing
│   ├── mutations/       # createUser, changePassword, updateProfile
│   └── fields/          # Custom field resolvers (lazy loading, etc.)
├── recipe/
│   ├── queries/         # getRecipeById, listRecipes
│   └── mutations/       # createRecipe, updateRecipe, deleteRecipe
└── metadata/
    └── queries/         # getCacheStats, getSystemMetadata
```

---

## Code Generation Workflow

### Why Codegen?

**Problem:** Manually writing GraphQL query results and input types is error-prone:
- Types can drift from schema
- Duplicated type definitions across frontend and backend
- No compile-time verification that queries match SDL

**Solution:** `@graphql-codegen/client-preset` automatically generates:
- Input types from schema (e.g., `IngredientInput`, `RecipeCreateInput`)
- Operation result types for each query/mutation
- Document registry for Apollo Client type safety
- Zero manual type maintenance

### Configuration

Configuration is in [`codegen.ts`](../codegen.ts):

```typescript
export default {
  schema: 'src/lib/graphql/typeDefs/**/*.graphql',
  documents: [
    'src/lib/graphql/queries.ts',
    'src/lib/graphql/mutations.ts',
  ],
  generates: {
    'src/lib/graphql/generated/': {
      preset: 'client',
      documentMode: 'string',  // Generates string docs for runtime validation
      onlyOperationTypes: true,  // Only operation-specific types
      preResolveTypes: true,     // Inline fragment types automatically
    },
  },
};
```

### Generated Artifacts

Output in [`src/lib/graphql/generated/`](../src/lib/graphql/generated/):

#### `graphql.ts`
Exported TypeScript types from the SDL schema:

```typescript
export type IngredientInput = {
  localId: string;
  name: string;
  quantity: number;
  unit: string;
  isOptional?: boolean;
  note?: string;
};

export type RecipeCreateInput = {
  title: string;
  description?: string;
  ingredients: IngredientInput[];
  instructions: string[];
  isPublic: boolean;
};
```

#### `gql.ts`
Document registry mapping GraphQL operation strings to TypeScript types:

```typescript
const documents: Documents = {
  "query GetRecipeById($id: ID!) { recipe(id: $id) { ... } }": 
    types.GetRecipeByIdDocument,
  "mutation CreateRecipe($input: RecipeCreateInput!) { createRecipe(input: $input) { ... } }":
    types.CreateRecipeDocument,
  // ... 20+ operations
};
```

#### `fragment-masking.ts`
Type safety utilities for GraphQL fragments (generated, eslint-disabled).

#### `index.ts`
Public export of all operation types and helpers.

### Running Codegen

```bash
# Generate types from schema + documents
pnpm codegen

# Verify artifacts are up-to-date (CI step)
pnpm codegen:check

# Watch for changes (optional)
pnpm codegen --watch
```

### CI Integration

In [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), after linting:

```yaml
- name: Verify GraphQL generated types
  run: pnpm codegen:check
```

This ensures the SDL and client documents stay synchronized. Failures indicate:
- A `.graphql` file was modified without regenerating types
- A query/mutation was added/modified without running `pnpm codegen`
- An operation type is no longer exported in `queries.ts` or `mutations.ts`

---

## Security Architecture

### 1. Persisted Queries (SHA-256 Allowlist)

**File:** [`src/lib/graphql/persistedQueryRegistry.ts`](../src/lib/graphql/persistedQueryRegistry.ts)

**Purpose:** Only allow GraphQL operations that the frontend explicitly knows about.

**How it works:**
1. All 21 client documents (`queries.ts` + `mutations.ts`) are imported
2. Each document is hashed with SHA-256
3. The allowlist is built at server startup

```typescript
const clientDocuments: DocumentNode[] = [
  GET_USER_BY_ID,
  GET_FAVORITE_RECIPES,
  CREATE_RECIPE,
  // ... all 21 client operations
];

export const persistedQueryHashes = new Set(
  clientDocuments.map(doc => getPersistedQueryHash(print(doc)))
);

export const isPersistedQueryAllowed = (query: string, persistedHash: string) =>
  persistedQueryHashes.has(persistedHash) &&
  getPersistedQueryHash(query) === persistedHash;
```

**Client side:** Apollo Client automatically computes the SHA-256 hash via `persistedQueryLink`:

```typescript
// src/lib/apollo/client.ts
const persistedQueryLink = new ApolloLink((operation, forward) => {
  operation.extensions.persistedQuery = {
    sha256Hash: await getBrowserPersistedQueryHash(operation.query),
    version: 1,
  };
  return forward(operation);
});
```

**Server validation:** In the GraphQL route handler:

```typescript
if (body.extensions?.persistedQuery?.sha256Hash) {
  const isAllowed = isPersistedQueryAllowed(
    query,
    body.extensions.persistedQuery.sha256Hash
  );
  if (!isAllowed) return new Response('Persisted query not found', { status: 400 });
}
```

**Benefits:**
- ✅ Prevents injection attacks (no arbitrary queries)
- ✅ Enables Automatic Persisted Queries (APQ) for smaller payloads
- ✅ Audit trail of which operations are being used

### 2. Field-Level Authorization

**File:** [`src/lib/graphql/fieldPolicies.ts`](../src/lib/graphql/fieldPolicies.ts)

**Purpose:** Control access to sensitive User fields without repeating auth logic.

**Implementation:**

```typescript
type FieldPolicy = (source: any, context: GraphQLContext) => boolean;

const isSelfOrAdmin: FieldPolicy = (source, context) =>
  context.role === 'ADMIN' ||
  Boolean(context.userId && source?.id && context.userId === source.id);

export const userFieldPolicies: Record<string, FieldPolicy> = {
  email: isSelfOrAdmin,  // Only owner or admin sees email
  // More fields can be added as needed
};
```

**Server enforcement:** A `fieldAuthPlugin` checks policies on every field resolution:

```typescript
const fieldAuthPlugin: ApolloServerPlugin = {
  async didResolveField({ objectType, fieldName, source, contextValue }) {
    if (objectType.name === 'User') {
      const policy = userFieldPolicies[fieldName];
      if (policy && !policy(source, contextValue)) {
        throw new GraphQLError(`Access denied: User.${fieldName}`);
      }
    }
  },
};
```

**Benefits:**
- ✅ Declarative authorization (easy to read and maintain)
- ✅ Scales to many fields without nested permission checks
- ✅ Enforced at the field resolver level (before data leaves the server)
- ✅ No business logic duplication

### 3. Context-Based Private Queries

**Motivation:** User queries should not accept a `userId` parameter from the client. Instead, they should derive it from the session.

**Example:** `getFavoriteRecipes` query

**Before (vulnerable):**
```typescript
// Client could pass any userId
const getFavoriteRecipes = async (
  _: unknown,
  { userId }: { userId: string },  // ❌ Client-controlled
  { }: GraphQLContext
) => UserService.getFavoriteRecipes(userId);
```

**After (secure):**
```typescript
// userId comes from session context only
const getFavoriteRecipes = async (
  _: unknown,
  _args: unknown,  // No arguments accepted
  { userId }: GraphQLContext  // Derived from session
) => {
  if (!userId) throw 'Unauthorized';
  return await UserService.getFavoriteRecipes(userId);
};
```

**Benefits:**
- ✅ Prevents user ID spoofing
- ✅ Clear intent: "this query is for the authenticated user"
- ✅ Easier to test (mock `context.userId` instead of worrying about parameter injection)

---

## Working with GraphQL

### Adding a New Query

1. **Define the SDL** in the appropriate `.graphql` file:

```graphql
# src/lib/graphql/typeDefs/recipe.graphql
extend type Query {
  getRecipesByIngredient(ingredient: String!): [Recipe!]!
}
```

2. **Implement the resolver**:

```typescript
// src/lib/graphql/resolvers/recipe/queries/getRecipesByIngredient.ts
export const getRecipesByIngredient = async (
  _: unknown,
  { ingredient }: { ingredient: string },
  { userId, dataloaders }: GraphQLContext
) => {
  return await RecipeService.getRecipesByIngredient(ingredient);
};
```

3. **Register in the schema**:

```typescript
// src/app/api/graphql/route.ts
import getRecipesByIngredient from '@/lib/graphql/resolvers/recipe/queries/getRecipesByIngredient';

// In the resolvers object
Query: {
  getRecipesByIngredient,
  // ... other queries
},
```

4. **Add to client documents**:

```typescript
// src/lib/graphql/queries.ts
export const GET_RECIPES_BY_INGREDIENT = gql`
  query GetRecipesByIngredient($ingredient: String!) {
    getRecipesByIngredient(ingredient: $ingredient) {
      id
      title
      slug
    }
  }
`;
```

5. **Run codegen**:

```bash
pnpm codegen
```

This generates `GetRecipesByIngredientQuery` type in `generated/graphql.ts`.

### Adding a New Mutation

1. **Define the SDL**:

```graphql
# src/lib/graphql/typeDefs/recipe.graphql
extend type Mutation {
  rateRecipe(id: ID!, rating: Int!): Boolean!
}
```

2. **Implement the resolver**:

```typescript
// src/lib/graphql/resolvers/recipe/mutations/rateRecipe.ts
export const rateRecipe = async (
  _: unknown,
  { id, rating }: { id: string; rating: number },
  { userId }: GraphQLContext
) => {
  if (!userId) throw 'Unauthorized';
  return await RecipeService.addRating(id, userId, rating);
};
```

3. **Register and add to documents**:

```typescript
// src/lib/graphql/mutations.ts
export const RATE_RECIPE = gql`
  mutation RateRecipe($id: ID!, $rating: Int!) {
    rateRecipe(id: $id, rating: $rating)
  }
`;
```

4. **Run codegen** and use in components:

```typescript
const [rateRecipe] = useMutation<RateRecipeMutation>(RATE_RECIPE);

const handleRate = async (recipeId: string, rating: number) => {
  const { data } = await rateRecipe({
    variables: { id: recipeId, rating },
  });
  if (data?.rateRecipe) {
    showNotification({ message: 'Rating saved!' });
  }
};
```

### Modifying Input Types

Input types are auto-generated from the SDL. To add a field:

1. **Modify the SDL**:

```graphql
# src/lib/graphql/typeDefs/recipe.graphql
input RecipeCreateInput {
  title: String!
  description: String
  ingredients: [IngredientInput!]!
  instructions: [String!]!
  isPublic: Boolean!
  source: String  # New field
}
```

2. **Run codegen**:

```bash
pnpm codegen
```

The `RecipeCreateInput` type is automatically updated in `generated/graphql.ts`.

3. **Update resolvers** to use the new field if needed:

```typescript
export const createRecipe = async (
  _: unknown,
  { input }: { input: RecipeCreateInput },
  { userId }: GraphQLContext
) => {
  // input.source is now available with full type safety
  return await RecipeService.create({
    ...input,
    userId,
  });
};
```

---

## Common Workflows

### Verify Generated Types Are Up-to-Date

```bash
pnpm codegen:check
```

Fails if any SDL or document changes haven't been regenerated. Useful before committing.

### Debug Generated Types

The generated files are at `src/lib/graphql/generated/`. You can inspect:

- `graphql.ts` – All input types and schema types
- `gql.ts` – Operation result types and document registry
- `fragment-masking.ts` – Fragment utilities

### Check Persisted Query Allowlist

The allowlist is built automatically on server startup. To verify which operations are allowed:

```typescript
import { persistedQueryHashes } from '@/lib/graphql/persistedQueryRegistry';
console.log(persistedQueryHashes); // Set of SHA-256 hashes
```

### Add a Field Policy

To restrict access to a new sensitive User field:

1. **Add to `fieldPolicies.ts`**:

```typescript
const isAdmin: FieldPolicy = (source, context) =>
  context.role === 'ADMIN';

export const userFieldPolicies: Record<string, FieldPolicy> = {
  email: isSelfOrAdmin,
  apiKeys: isAdmin,  // New: only admins see API keys
};
```

2. **No resolver changes needed** – the `fieldAuthPlugin` handles enforcement.

---

## Best Practices

1. **Always run `pnpm codegen`** after modifying any `.graphql` file or adding operations to `queries.ts`/`mutations.ts`
2. **Keep resolvers organized** – one resolver file per query/mutation
3. **Use context for auth** – never accept user IDs as query parameters
4. **Declare field policies** – don't hardcode auth checks in resolver logic
5. **Test with generated types** – import from `generated/graphql.ts` and `generated/gql.ts`
6. **Verify persisted queries** in production – check `isPersistedQueryAllowed` logs to audit which queries are being used

---

## References

- [GraphQL Code Generator Documentation](https://the-guild.dev/graphql/codegen)
- [Apollo Server 5 Documentation](https://www.apollographql.com/docs/apollo-server/)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [Automatic Persisted Queries (APQ)](https://www.apollographql.com/docs/apollo-server/performance/apq/)
