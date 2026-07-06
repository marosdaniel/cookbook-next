import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockResetPassword } = vi.hoisted(() => ({
  mockResetPassword: vi.fn(),
}));

vi.mock('@/lib/services/UserService', () => ({
  UserService: {
    resetPassword: mockResetPassword,
  },
}));

import { resetPassword } from './resetPassword';

describe('resetPassword resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates password reset requests to the user service', async () => {
    mockResetPassword.mockResolvedValue(true);

    const result = await resetPassword({}, { email: 'user@example.com' });

    expect(mockResetPassword).toHaveBeenCalledWith('user@example.com');
    expect(result).toBe(true);
  });
});
