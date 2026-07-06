import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphQLContext } from '@/types/graphql/context';

const { mockCreateUser } = vi.hoisted(() => ({
  mockCreateUser: vi.fn(),
}));

vi.mock('@/lib/services/UserService', () => ({
  UserService: {
    createUser: mockCreateUser,
  },
}));

import { createUser } from './createUser';

describe('createUser resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates user registration to the user service', async () => {
    mockCreateUser.mockResolvedValue({ id: 'user-1' });

    const context: GraphQLContext = {
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await createUser(
      {},
      {
        userRegisterInput: {
          firstName: 'Ada',
          lastName: 'Lovelace',
          userName: 'ada',
          email: 'user@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        },
      },
      context,
    );

    expect(mockCreateUser).toHaveBeenCalledWith({
      firstName: 'Ada',
      lastName: 'Lovelace',
      userName: 'ada',
      email: 'user@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });
    expect(result).toEqual({ id: 'user-1' });
  });
});
