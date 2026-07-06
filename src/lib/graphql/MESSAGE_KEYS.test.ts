import { describe, expect, it } from 'vitest';
import {
  USER_FAVORITE_MESSAGE_KEYS,
  USER_FOLLOW_MESSAGE_KEYS,
  USER_REGISTER_MESSAGE_KEYS,
} from './MESSAGE_KEYS';

describe('message key catalogs', () => {
  it('exposes the expected user-facing message key groups', () => {
    expect(USER_FAVORITE_MESSAGE_KEYS.SUCCESS).toBe(
      'response.userFavoriteSuccess',
    );
    expect(USER_FOLLOW_MESSAGE_KEYS.FOLLOW_SUCCESS).toBe(
      'response.userFollowSuccess',
    );
    expect(USER_REGISTER_MESSAGE_KEYS.SUCCESS).toBe(
      'response.userRegisterSuccess',
    );
  });
});
