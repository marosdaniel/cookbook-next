import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUserRepository, mockHashPassword, mockSendWelcomeEmail } =
  vi.hoisted(() => ({
    mockUserRepository: {
      findPublicById: vi.fn(),
      findById: vi.fn(),
      findByUserNameOrEmailInsensitive: vi.fn(),
      createUser: vi.fn(),
      updateProfile: vi.fn(),
      findByIdWithRecipeIdentifiers: vi.fn(),
      deleteById: vi.fn(),
    },
    mockHashPassword: vi.fn(),
    mockSendWelcomeEmail: vi.fn(),
  }));

vi.mock('@/lib/prisma/prisma', () => ({ prisma: {} }));
vi.mock('@/lib/redis/redis', () => ({ redis: {} }));

vi.mock('@/lib/auth/password', () => ({
  hashPassword: mockHashPassword,
  verifyPassword: vi.fn(),
}));

vi.mock('@/lib/email/nodemailer', () => ({
  generateResetToken: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendWelcomeEmail: mockSendWelcomeEmail,
}));

vi.mock('@/server/platform/cache', () => ({
  invalidateCacheScope: vi.fn(),
}));

vi.mock('@/server/platform/postResponse', () => ({
  schedulePostResponseTask: vi.fn(),
}));

vi.mock('./repository', () => ({ UserRepository: mockUserRepository }));
vi.mock('./deletionRepository', () => ({
  DeletionRepository: {},
}));

import { schedulePostResponseTask } from '@/server/platform/postResponse';
import { AccountService } from './accountService';

const VALID_PASSWORD = 'Passw0rd!';

const validRegisterInput = (overrides: Partial<Record<string, unknown>> = {}) =>
  ({
    firstName: 'Anna',
    lastName: 'Kovacs',
    userName: 'anna_k',
    email: 'Anna@Example.com',
    password: VALID_PASSWORD,
    confirmPassword: VALID_PASSWORD,
    ...overrides,
  }) as Parameters<typeof AccountService.createUser>[0];

const storedUser = {
  id: 'user-1',
  firstName: 'Anna',
  lastName: 'Kovacs',
  userName: 'anna_k',
  email: 'anna@example.com',
  locale: 'en-gb',
};

describe('AccountService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserById', () => {
    it('returns the public user profile', async () => {
      mockUserRepository.findPublicById.mockResolvedValue(storedUser);

      await expect(AccountService.getUserById('user-1')).resolves.toEqual(
        storedUser,
      );
      expect(mockUserRepository.findPublicById).toHaveBeenCalledWith('user-1');
    });

    it('throws NOT_FOUND when the user does not exist', async () => {
      mockUserRepository.findPublicById.mockResolvedValue(null);

      await expect(AccountService.getUserById('missing')).rejects.toMatchObject(
        { extensions: { code: 'NOT_FOUND' } },
      );
    });
  });

  describe('createUser', () => {
    it('rejects mismatching passwords with VALIDATION_ERROR', async () => {
      await expect(
        AccountService.createUser(
          validRegisterInput({ confirmPassword: 'Different1!' }),
        ),
      ).rejects.toMatchObject({ extensions: { code: 'VALIDATION_ERROR' } });

      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
    });

    it('rejects weak passwords with VALIDATION_ERROR', async () => {
      await expect(
        AccountService.createUser(
          validRegisterInput({ password: 'weak', confirmPassword: 'weak' }),
        ),
      ).rejects.toMatchObject({ extensions: { code: 'VALIDATION_ERROR' } });

      expect(mockHashPassword).not.toHaveBeenCalled();
    });

    it('throws CONFLICT when the username is already taken (case-insensitive)', async () => {
      mockUserRepository.findByUserNameOrEmailInsensitive.mockResolvedValue({
        userName: 'ANNA_K',
        email: 'someone@example.com',
      });

      await expect(
        AccountService.createUser(validRegisterInput()),
      ).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });

      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
    });

    it('throws CONFLICT when the email is already registered (case-insensitive)', async () => {
      mockUserRepository.findByUserNameOrEmailInsensitive.mockResolvedValue({
        userName: 'someone_else',
        email: 'anna@EXAMPLE.com',
      });

      await expect(
        AccountService.createUser(validRegisterInput()),
      ).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });

      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
    });

    it('creates the user with a hashed password, lowercased email and default locale', async () => {
      mockUserRepository.findByUserNameOrEmailInsensitive.mockResolvedValue(
        null,
      );
      mockHashPassword.mockResolvedValue('hashed-password');
      mockUserRepository.createUser.mockResolvedValue(storedUser);

      const result = await AccountService.createUser(validRegisterInput());

      expect(mockHashPassword).toHaveBeenCalledWith(VALID_PASSWORD);
      expect(mockUserRepository.createUser).toHaveBeenCalledWith({
        firstName: 'Anna',
        lastName: 'Kovacs',
        userName: 'anna_k',
        email: 'anna@example.com',
        password: 'hashed-password',
        locale: 'en-gb',
      });
      expect(result).toMatchObject({
        success: true,
        statusCode: 201,
        user: { ...storedUser, recipes: [], favoriteRecipes: [] },
      });
    });

    it('uses the requested locale when one is provided', async () => {
      mockUserRepository.findByUserNameOrEmailInsensitive.mockResolvedValue(
        null,
      );
      mockHashPassword.mockResolvedValue('hashed-password');
      mockUserRepository.createUser.mockResolvedValue({
        ...storedUser,
        locale: 'hu-hu',
      });

      await AccountService.createUser(validRegisterInput({ locale: 'hu-hu' }));

      expect(mockUserRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ locale: 'hu-hu' }),
      );
    });

    it('schedules the welcome email after the response without blocking registration', async () => {
      mockUserRepository.findByUserNameOrEmailInsensitive.mockResolvedValue(
        null,
      );
      mockHashPassword.mockResolvedValue('hashed-password');
      mockUserRepository.createUser.mockResolvedValue(storedUser);

      await AccountService.createUser(validRegisterInput());

      expect(schedulePostResponseTask).toHaveBeenCalledTimes(1);
      const [task, errorLabel] = vi.mocked(schedulePostResponseTask).mock
        .calls[0];
      expect(errorLabel).toBe('Error sending welcome email:');

      await task();
      expect(mockSendWelcomeEmail).toHaveBeenCalledWith(
        'anna@example.com',
        'Anna',
      );
    });
  });

  describe('deleteUser guards', () => {
    it('forbids a non-admin from deleting another account', async () => {
      await expect(
        AccountService.deleteUser('user-1', 'USER', 'user-2'),
      ).rejects.toMatchObject({ extensions: { code: 'FORBIDDEN' } });

      expect(
        mockUserRepository.findByIdWithRecipeIdentifiers,
      ).not.toHaveBeenCalled();
    });

    it('throws NOT_FOUND when the target account does not exist', async () => {
      mockUserRepository.findByIdWithRecipeIdentifiers.mockResolvedValue(null);

      await expect(
        AccountService.deleteUser('user-1', 'USER', 'user-1'),
      ).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });

      expect(mockUserRepository.deleteById).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    const existingUser = {
      id: 'user-1',
      firstName: 'Anna',
      lastName: 'Kovacs',
      locale: 'en-gb',
    };

    it('throws NOT_FOUND and does not update when the user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        AccountService.updateUser('missing', { locale: 'hu-hu' } as never),
      ).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });

      expect(mockUserRepository.updateProfile).not.toHaveBeenCalled();
    });

    it('keeps the stored names when only the locale is updated', async () => {
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.updateProfile.mockResolvedValue({
        ...existingUser,
        locale: 'hu-hu',
      });

      const result = await AccountService.updateUser('user-1', {
        locale: 'hu-hu',
      } as never);

      expect(mockUserRepository.updateProfile).toHaveBeenCalledWith('user-1', {
        firstName: 'Anna',
        lastName: 'Kovacs',
        locale: 'hu-hu',
      });
      expect(result).toMatchObject({
        success: true,
        message: 'User updated successfully',
        user: { locale: 'hu-hu' },
      });
    });

    it('applies new names and keeps the stored locale when it is not provided', async () => {
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.updateProfile.mockResolvedValue(existingUser);

      await AccountService.updateUser('user-1', {
        firstName: 'Eva',
        lastName: 'Nagy',
      } as never);

      expect(mockUserRepository.updateProfile).toHaveBeenCalledWith('user-1', {
        firstName: 'Eva',
        lastName: 'Nagy',
        locale: 'en-gb',
      });
    });

    it('rejects an empty name instead of overwriting the stored one', async () => {
      mockUserRepository.findById.mockResolvedValue(existingUser);

      await expect(
        AccountService.updateUser('user-1', { firstName: '' } as never),
      ).rejects.toMatchObject({ extensions: { code: 'VALIDATION_ERROR' } });

      expect(mockUserRepository.updateProfile).not.toHaveBeenCalled();
    });

    it('rejects an invalid name with a GraphQL VALIDATION_ERROR, not a raw ZodError', async () => {
      mockUserRepository.findById.mockResolvedValue(existingUser);

      await expect(
        AccountService.updateUser('user-1', { lastName: 'Nagy1' } as never),
      ).rejects.toMatchObject({ extensions: { code: 'VALIDATION_ERROR' } });

      expect(mockUserRepository.updateProfile).not.toHaveBeenCalled();
    });
  });
});
