import '@testing-library/jest-dom';
import type { AnchorHTMLAttributes } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@/utils/test-utils';
import FollowingClient from './FollowingClient';

const mocks = vi.hoisted(() => ({
  useSession: vi.fn(),
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useTranslations: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => mocks.useSession(),
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: () => mocks.useQuery(),
  useMutation: () => mocks.useMutation(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>,
}));

vi.mock('@/components/Recipe/RecipeCarousel', () => ({
  RecipeCarousel: ({ recipes }: { recipes: Array<{ id: string }> }) => (
    <div data-testid="recipe-carousel">
      {recipes.length ? 'carousel-content' : 'empty-carousel'}
    </div>
  ),
}));

describe('FollowingClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useSession.mockReturnValue({
      data: { user: { id: 'user-1' } },
      status: 'authenticated',
    });
  });

  it('renders the loading skeleton state while following users are loading', () => {
    mocks.useQuery.mockReturnValue({ data: undefined, loading: true });
    mocks.useMutation.mockReturnValue([vi.fn()]);

    render(<FollowingClient />);

    expect(screen.getByTestId('following-loading')).toBeInTheDocument();
  });

  it('shows the empty state when the user is not following anyone', () => {
    mocks.useQuery.mockReturnValue({
      data: { getFollowing: { users: [], totalFollowing: 0 } },
      loading: false,
    });
    mocks.useMutation.mockReturnValue([vi.fn()]);

    render(<FollowingClient />);

    expect(screen.getByTestId('following-empty')).toBeInTheDocument();
    expect(screen.getByText('noFollowingYet')).toBeInTheDocument();
  });

  it('renders followed users, their latest recipes and allows unfollowing', () => {
    const unfollow = vi.fn().mockResolvedValue(undefined);
    mocks.useQuery.mockReturnValue({
      data: {
        getFollowing: {
          users: [
            {
              id: 'u-1',
              firstName: 'Ada',
              lastName: 'Lovelace',
              userName: 'ada',
              recipeCount: 2,
              latestRecipes: [{ id: 'recipe-1' }],
            },
          ],
          totalFollowing: 1,
        },
      },
      loading: false,
    });
    mocks.useMutation.mockReturnValue([unfollow]);

    render(<FollowingClient />);

    expect(screen.getByTestId('following-page')).toBeInTheDocument();
    expect(screen.getByTestId('following-user-card-u-1')).toBeInTheDocument();
    expect(
      screen.getByTestId('following-latest-recipes-u-1'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('following-unfollow-button'));

    expect(unfollow).toHaveBeenCalledWith({
      variables: { targetUserId: 'u-1' },
      refetchQueries: ['getFollowing'],
    });
  });
});
