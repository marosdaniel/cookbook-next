import crypto from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockUserRepository,
  mockInvalidateCacheScope,
  mockHashPassword,
  mockVerifyPassword,
  mockGenerateResetToken,
  mockSendPasswordResetEmail,
  mockCheckRateLimit,
  mockSchedule,
} = vi.hoisted(() => ({
  mockUserRepository: {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    savePasswordResetToken: vi.fn(),
    findValidResetTokenUser: vi.fn(),
    updatePasswordAndIncrementSession: vi.fn(),
  },
  mockInvalidateCacheScope: vi.fn(),
  mockHashPassword: vi.fn(),
  mockVerifyPassword: vi.fn(),
  mockGenerateResetToken: vi.fn(),
  mockSendPasswordResetEmail: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockSchedule: vi.fn(),
}));

vi.mock('./repository', () => ({ UserRepository: mockUserRepository }));
vi.mock('@/server/platform/cache', () => ({
  invalidateCacheScope: mockInvalidateCacheScope,
}));
vi.mock('@/server/platform/postResponse', () => ({
  schedulePostResponseTask: mockSchedule,
}));
vi.mock('@/lib/auth/password', () => ({
  hashPassword: mockHashPassword,
  verifyPassword: mockVerifyPassword,
}));
vi.mock('@/lib/email/nodemailer', () => ({
  generateResetToken: mockGenerateResetToken,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
}));
vi.mock('@/lib/rateLimit/rateLimit', () => ({
  checkPasswordResetEmailRateLimit: mockCheckRateLimit,
}));

import { PasswordService } from './passwordService';

const sha256 = (value: string) =>
  crypto.createHash('sha256').update(value).digest('hex');

const OLD_PASSWORD = 'OldPassw0rd!';
const NEW_PASSWORD = 'NewPassw0rd!';

describe('PasswordService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({ success: true });
    mockHashPassword.mockResolvedValue('hashed-new');
  });

  describe('changePassword', () => {
    const input = {
      currentPassword: OLD_PASSWORD,
      newPassword: NEW_PASSWORD,
      confirmNewPassword: NEW_PASSWORD,
    };

    it('updates the password and invalidates the session cache', async () => {
      mockUserRepository.findById.mockResolvedValue({
        id: 'u-1',
        password: 'hashed-old',
      });
      mockVerifyPassword.mockResolvedValue(true);

      await expect(PasswordService.changePassword('u-1', input)).resolves.toBe(
        true,
      );

      expect(mockVerifyPassword).toHaveBeenCalledWith(
        OLD_PASSWORD,
        'hashed-old',
      );
      expect(
        mockUserRepository.updatePasswordAndIncrementSession,
      ).toHaveBeenCalledWith('u-1', 'hashed-new');
      expect(mockInvalidateCacheScope).toHaveBeenCalledWith({
        sessionUserId: 'u-1',
      });
    });

    it('rejects input that fails validation', async () => {
      await expect(
        PasswordService.changePassword('u-1', {
          ...input,
          confirmNewPassword: 'Mismatch0',
        }),
      ).rejects.toMatchObject({
        extensions: { code: 'VALIDATION_ERROR' },
      });
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('throws NOT_FOUND when the user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        PasswordService.changePassword('u-1', input),
      ).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
    });

    it('throws BAD_REQUEST when the current password is wrong', async () => {
      mockUserRepository.findById.mockResolvedValue({
        id: 'u-1',
        password: 'hashed-old',
      });
      mockVerifyPassword.mockResolvedValue(false);

      await expect(
        PasswordService.changePassword('u-1', input),
      ).rejects.toMatchObject({ extensions: { code: 'BAD_REQUEST' } });
      expect(
        mockUserRepository.updatePasswordAndIncrementSession,
      ).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('returns the uniform response for an unknown email without sending mail', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await PasswordService.resetPassword('nobody@example.com');

      expect(result.success).toBe(true);
      expect(mockUserRepository.savePasswordResetToken).not.toHaveBeenCalled();
      expect(mockSchedule).not.toHaveBeenCalled();
    });

    it('stores only the hash of the token and schedules the email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        email: 'user@example.com',
      });
      mockGenerateResetToken.mockReturnValue('raw-token');

      const result = await PasswordService.resetPassword('User@Example.com');

      expect(result.success).toBe(true);
      expect(mockCheckRateLimit).toHaveBeenCalledWith('user@example.com');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'user@example.com',
      );
      const [email, storedHash, expires] =
        mockUserRepository.savePasswordResetToken.mock.calls[0];
      expect(email).toBe('user@example.com');
      expect(storedHash).toBe(sha256('raw-token'));
      expect(storedHash).not.toBe('raw-token');
      expect(expires).toBeInstanceOf(Date);
      expect(expires.getTime() - Date.now()).toBeGreaterThan(59 * 60 * 1000);

      expect(mockSchedule).toHaveBeenCalledTimes(1);
      const [task, message] = mockSchedule.mock.calls[0];
      expect(message).toBe('Error sending reset email:');
      await task();
      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
        'user@example.com',
        'raw-token',
      );
    });

    it('throws RATE_LIMITED when the email limiter rejects the request', async () => {
      mockCheckRateLimit.mockResolvedValue({ success: false });

      await expect(
        PasswordService.resetPassword('user@example.com'),
      ).rejects.toMatchObject({ extensions: { code: 'RATE_LIMITED' } });
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('throws VALIDATION_ERROR for a malformed email', async () => {
      await expect(
        PasswordService.resetPassword('not-an-email'),
      ).rejects.toMatchObject({ extensions: { code: 'VALIDATION_ERROR' } });
      expect(mockCheckRateLimit).not.toHaveBeenCalled();
    });
  });

  describe('setNewPassword', () => {
    it('looks up the user by the hash of the raw token', async () => {
      mockUserRepository.findValidResetTokenUser.mockResolvedValue({
        id: 'u-1',
      });

      const result = await PasswordService.setNewPassword({
        token: 'raw-token',
        newPassword: NEW_PASSWORD,
      });

      expect(mockUserRepository.findValidResetTokenUser).toHaveBeenCalledWith(
        sha256('raw-token'),
      );
      expect(
        mockUserRepository.updatePasswordAndIncrementSession,
      ).toHaveBeenCalledWith('u-1', 'hashed-new', true);
      expect(mockInvalidateCacheScope).toHaveBeenCalledWith({
        sessionUserId: 'u-1',
      });
      expect(result.success).toBe(true);
    });

    it('rejects a weak new password before touching the repository', async () => {
      await expect(
        PasswordService.setNewPassword({
          token: 'raw-token',
          newPassword: 'weak',
        }),
      ).rejects.toMatchObject({ extensions: { code: 'VALIDATION_ERROR' } });
      expect(mockUserRepository.findValidResetTokenUser).not.toHaveBeenCalled();
    });

    it('throws BAD_REQUEST for an unknown or expired token', async () => {
      mockUserRepository.findValidResetTokenUser.mockResolvedValue(null);

      await expect(
        PasswordService.setNewPassword({
          token: 'expired',
          newPassword: NEW_PASSWORD,
        }),
      ).rejects.toMatchObject({ extensions: { code: 'BAD_REQUEST' } });
      expect(
        mockUserRepository.updatePasswordAndIncrementSession,
      ).not.toHaveBeenCalled();
    });
  });
});
