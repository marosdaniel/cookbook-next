import { GraphQLError } from 'graphql';
import { describe, expect, it } from 'vitest';
import { fieldAuthPlugin } from './fieldAuth';

type WillResolveFieldArgs = {
  contextValue: { userId?: string; role?: 'ADMIN' | 'USER' };
  info: { parentType: { name: string }; fieldName: string };
  source: { id?: string } | null;
};

const getWillResolveField = async () => {
  const listener = await fieldAuthPlugin.requestDidStart?.(undefined as never);
  const hooks = await listener?.executionDidStart?.(undefined as never);
  return hooks?.willResolveField as (args: WillResolveFieldArgs) => void;
};

const runField = async (args: WillResolveFieldArgs) => {
  const willResolveField = await getWillResolveField();
  return willResolveField(args);
};

describe('fieldAuthPlugin', () => {
  it('ignores fields that are not on the User type', async () => {
    await expect(
      runField({
        contextValue: {},
        info: { parentType: { name: 'Recipe' }, fieldName: 'email' },
        source: { id: 'u-1' },
      }),
    ).resolves.toBeUndefined();
  });

  it('allows fields without a policy', async () => {
    await expect(
      runField({
        contextValue: {},
        info: { parentType: { name: 'User' }, fieldName: 'name' },
        source: { id: 'u-1' },
      }),
    ).resolves.toBeUndefined();
  });

  it('allows a user to resolve their own protected field', async () => {
    await expect(
      runField({
        contextValue: { userId: 'u-1', role: 'USER' },
        info: { parentType: { name: 'User' }, fieldName: 'email' },
        source: { id: 'u-1' },
      }),
    ).resolves.toBeUndefined();
  });

  it('allows an admin to resolve another user’s protected field', async () => {
    await expect(
      runField({
        contextValue: { userId: 'admin-1', role: 'ADMIN' },
        info: { parentType: { name: 'User' }, fieldName: 'email' },
        source: { id: 'u-2' },
      }),
    ).resolves.toBeUndefined();
  });

  it('throws FORBIDDEN when another user requests a protected field', async () => {
    const promise = runField({
      contextValue: { userId: 'u-1', role: 'USER' },
      info: { parentType: { name: 'User' }, fieldName: 'favoriteRecipes' },
      source: { id: 'u-2' },
    });

    await expect(promise).rejects.toBeInstanceOf(GraphQLError);
    await expect(promise).rejects.toMatchObject({
      message: 'Unauthorized field access',
      extensions: { code: 'FORBIDDEN', http: { status: 403 } },
    });
  });

  it('throws FORBIDDEN for anonymous access to a protected field', async () => {
    await expect(
      runField({
        contextValue: {},
        info: { parentType: { name: 'User' }, fieldName: 'email' },
        source: { id: 'u-2' },
      }),
    ).rejects.toMatchObject({ extensions: { code: 'FORBIDDEN' } });
  });
});
