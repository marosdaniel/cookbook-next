import { describe, expect, it } from 'vitest';
import { canResolveUserField } from './fieldPolicies';

describe('user field policies', () => {
  it('allows email for the current user', () => {
    expect(
      canResolveUserField('email', { id: 'user-1' }, { userId: 'user-1' }),
    ).toBe(true);
  });

  it('allows email for admins', () => {
    expect(
      canResolveUserField('email', { id: 'user-1' }, { role: 'ADMIN' }),
    ).toBe(true);
  });

  it('denies email for another user', () => {
    expect(
      canResolveUserField('email', { id: 'user-2' }, { userId: 'user-1' }),
    ).toBe(false);
  });

  it('allows fields without a registered policy', () => {
    expect(
      canResolveUserField('userName', { id: 'user-2' }, { userId: 'user-1' }),
    ).toBe(true);
  });
});
