import { Kind, type ObjectTypeDefinitionNode, parse } from 'graphql';
import { describe, expect, it } from 'vitest';
import { ROOT_FIELD_POLICY } from '@/lib/graphql/operationsConfig';
import { typeDefs } from '@/lib/graphql/schema';
import {
  assertGraphQLRootFieldsAuthorized,
  collectRootFields,
  rootFieldAuthPlugin,
} from './rootFieldAuth';

describe('rootFieldAuth', () => {
  it('collects direct, inline-fragment, and named-fragment root fields', () => {
    const doc = parse(`
      fragment AdminFields on Mutation {
        deleteAllUser(confirmation: "DELETE_ALL")
      }
      mutation GetRecipes {
        createRecipe(recipeCreateInput: { title: "T", ingredients: [], preparationSteps: [], category: { value: "c", label: "C" }, cookingTime: 10, difficultyLevel: { value: "e", label: "E" }, servings: 2 }) {
          id
        }
        ... on Mutation {
          deleteRecipe(id: "1")
        }
        ...AdminFields
      }
    `);
    const op = doc.definitions.find(
      (def) => def.kind === Kind.OPERATION_DEFINITION,
    );
    expect(op).toBeDefined();
    if (!op) throw new Error('Expected operation definition');
    expect(collectRootFields(doc, op)).toEqual([
      'createRecipe',
      'deleteRecipe',
      'deleteAllUser',
    ]);
  });

  it('rejects operation-name spoofing when a public operation name wraps an admin root field', () => {
    const doc = parse(`
      mutation GetRecipes {
        deleteAllUser(confirmation: "DELETE_ALL")
      }
    `);
    const op = doc.definitions.find(
      (def) => def.kind === Kind.OPERATION_DEFINITION,
    );

    expect(() =>
      assertGraphQLRootFieldsAuthorized(doc, op, 'GetRecipes', 'USER'),
    ).toThrow(
      "Unauthorized: you don't have permission to perform 'deleteAllUser'",
    );
  });

  it('rejects protected root fields hidden inside fragments or inline fragments', () => {
    const doc = parse(`
      fragment HiddenMutation on Mutation {
        deleteAllRecipes(confirmation: "DELETE_ALL")
      }
      mutation GetRecipes {
        ... on Mutation {
          ...HiddenMutation
        }
      }
    `);
    const op = doc.definitions.find(
      (def) => def.kind === Kind.OPERATION_DEFINITION,
    );

    expect(() =>
      assertGraphQLRootFieldsAuthorized(doc, op, 'GetRecipes', 'USER'),
    ).toThrow(
      "Unauthorized: you don't have permission to perform 'deleteAllRecipes'",
    );
  });

  it('allows multi-field operations when caller role satisfies every root field', async () => {
    const doc = parse(`
      query HomeBundle {
        getRecipes(limit: 4) { totalRecipes }
        getAllMetadata { key }
      }
    `);
    const op = doc.definitions.find(
      (def) => def.kind === Kind.OPERATION_DEFINITION,
    );

    const listener = await rootFieldAuthPlugin.requestDidStart?.({} as never);
    const contextValue = { role: undefined, operationName: null };
    await expect(
      listener?.didResolveOperation?.({
        document: doc,
        operation: op,
        operationName: 'HomeBundle',
        contextValue,
      } as never),
    ).resolves.toBeUndefined();
    expect(contextValue.operationName).toBe('HomeBundle');
  });

  it('has an explicit policy in ROOT_FIELD_POLICY for every Query and Mutation field in SDL', () => {
    const schemaFields: string[] = [];

    for (const def of typeDefs.definitions) {
      if (
        (def.kind === Kind.OBJECT_TYPE_DEFINITION ||
          def.kind === Kind.OBJECT_TYPE_EXTENSION) &&
        (def.name.value === 'Query' || def.name.value === 'Mutation')
      ) {
        const objDef = def as ObjectTypeDefinitionNode;
        for (const field of objDef.fields ?? []) {
          schemaFields.push(field.name.value);
        }
      }
    }

    expect(schemaFields.length).toBeGreaterThan(0);
    for (const fieldName of schemaFields) {
      expect(
        ROOT_FIELD_POLICY[fieldName],
        `Missing ROOT_FIELD_POLICY entry for schema field "${fieldName}"`,
      ).toBeDefined();
    }
  });
});
