import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InsightUserDetail } from '@/types/adminInsights';

const mocks = vi.hoisted(() => ({
  changeUserRoleAction: vi.fn(),
  deleteUserAction: vi.fn(),
  showSuccessNotification: vi.fn(),
  showErrorNotification: vi.fn(),
}));

vi.mock('../actions', () => ({
  changeUserRoleAction: mocks.changeUserRoleAction,
  deleteUserAction: mocks.deleteUserAction,
}));
vi.mock('@/utils/notifications', () => ({
  showSuccessNotification: mocks.showSuccessNotification,
  showErrorNotification: mocks.showErrorNotification,
}));

import { useUserActions } from './useUserActions';

const user: InsightUserDetail = {
  id: 'u1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  userName: 'ada',
  email: 'ada@example.com',
  role: 'USER',
  recipeCount: 4,
  joinedAt: '2026-10-01T08:00:00.000Z',
  locale: 'hu',
  updatedAt: '2026-10-02T09:30:00.000Z',
  favoriteCount: 3,
  ratingCount: 5,
  followerCount: 7,
  followingCount: 1,
};

describe('useUserActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('changes the role and reports success', async () => {
    mocks.changeUserRoleAction.mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useUserActions(vi.fn()));

    await act(async () => {
      result.current.changeRole(user, 'BLOGGER');
    });

    await waitFor(() =>
      expect(mocks.showSuccessNotification).toHaveBeenCalledTimes(1),
    );
    expect(mocks.changeUserRoleAction).toHaveBeenCalledWith('u1', 'BLOGGER');
    expect(mocks.showErrorNotification).not.toHaveBeenCalled();
  });

  it('reports a failed role change', async () => {
    mocks.changeUserRoleAction.mockResolvedValue({
      ok: false,
      error: 'SELF_ACTION',
    });
    const { result } = renderHook(() => useUserActions(vi.fn()));

    await act(async () => {
      result.current.changeRole(user, 'ADMIN');
    });

    await waitFor(() =>
      expect(mocks.showErrorNotification).toHaveBeenCalledTimes(1),
    );
    expect(mocks.showSuccessNotification).not.toHaveBeenCalled();
  });

  it('tracks the user to delete and clears it on cancel', () => {
    const { result } = renderHook(() => useUserActions(vi.fn()));

    act(() => result.current.requestDelete(user));
    expect(result.current.deleteTarget).toEqual(user);

    act(() => result.current.cancelDelete());
    expect(result.current.deleteTarget).toBeNull();
  });

  it('deletes the user, reports success and notifies the caller', async () => {
    mocks.deleteUserAction.mockResolvedValue({ ok: true });
    const onDeleted = vi.fn();
    const { result } = renderHook(() => useUserActions(onDeleted));

    act(() => result.current.requestDelete(user));
    await act(async () => {
      result.current.confirmDelete(user);
    });

    await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1));
    expect(mocks.deleteUserAction).toHaveBeenCalledWith('u1');
    expect(mocks.showSuccessNotification).toHaveBeenCalledTimes(1);
    expect(result.current.deleteTarget).toBeNull();
  });

  it('keeps the caller untouched when the deletion fails', async () => {
    mocks.deleteUserAction.mockResolvedValue({
      ok: false,
      error: 'NOT_FOUND',
    });
    const onDeleted = vi.fn();
    const { result } = renderHook(() => useUserActions(onDeleted));

    await act(async () => {
      result.current.confirmDelete(user);
    });

    await waitFor(() =>
      expect(mocks.showErrorNotification).toHaveBeenCalledTimes(1),
    );
    expect(onDeleted).not.toHaveBeenCalled();
  });
});
