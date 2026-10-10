import { describe, expect, it } from 'vitest';
import { resolveAdminActor } from './utils';

describe('resolveAdminActor', () => {
  it('returns the acting user and role', () => {
    expect(
      resolveAdminActor({
        userId: 'admin-1',
        role: 'ADMIN',
      } as never),
    ).toEqual({ actorId: 'admin-1', actorRole: 'ADMIN' });
  });

  it('throws when the request has no user or role', () => {
    expect(() => resolveAdminActor({ userId: 'admin-1' } as never)).toThrow(
      'Unauthenticated operation - no user found',
    );
    expect(() => resolveAdminActor({ role: 'ADMIN' } as never)).toThrow(
      'Unauthenticated operation - no user found',
    );
  });
});
