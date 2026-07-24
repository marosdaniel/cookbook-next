import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphQLContext } from '@/types/graphql/context';

const { mockChangePassword, mockThrowCustomError } = vi.hoisted(() => ({
  mockChangePassword: vi.fn(),
  mockThrowCustomError: vi.fn(),
}));

vi.mock('@/lib/services/UserService', () => ({
  UserService: {
    changePassword: mockChangePassword,
  },
}));

vi.mock('@/lib/validation/throwCustomError', () => ({
  throwCustomError: mockThrowCustomError,
}));

import { changePassword } from './changePassword';

describe('changePassword resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an unauthorized error when no user is authenticated', async () => {
    mockThrowCustomError.mockReturnValue('unauthorized');

    const context: GraphQLContext = {
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await changePassword(
      {},
      {
        passwordEditInput: {
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        },
      },
      context,
    );

    expect(mockThrowCustomError).toHaveBeenCalled();
    expect(result).toBe('unauthorized');
  });

  it('delegates password changes to the user service', async () => {
    mockChangePassword.mockResolvedValue(true);

    const context: GraphQLContext = {
      userId: 'user-1',
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await changePassword(
      {},
      {
        passwordEditInput: {
          currentPassword: 'old',
          newPassword: 'newPass123!',
          confirmNewPassword: 'newPass123!',
        },
      },
      context,
    );

    expect(mockChangePassword).toHaveBeenCalledWith('user-1', {
      currentPassword: 'old',
      newPassword: 'newPass123!',
      confirmNewPassword: 'newPass123!',
    });
    expect(result).toEqual({
      success: true,
      message: 'Password changed successfully',
    });
  });
});
