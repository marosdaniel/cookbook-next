import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockSetNewPassword } = vi.hoisted(() => ({
  mockSetNewPassword: vi.fn(),
}));

vi.mock('@/lib/services/UserService', () => ({
  UserService: {
    setNewPassword: mockSetNewPassword,
  },
}));

import { setNewPassword } from './setNewPassword';

describe('setNewPassword resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates token-based password resets to the user service', async () => {
    mockSetNewPassword.mockResolvedValue(true);

    const result = await setNewPassword({}, {
      token: 'token-1',
      password: 'Strong123!',
    } as never);

    expect(mockSetNewPassword).toHaveBeenCalledWith({
      token: 'token-1',
      password: 'Strong123!',
    });
    expect(result).toBe(true);
  });
});
