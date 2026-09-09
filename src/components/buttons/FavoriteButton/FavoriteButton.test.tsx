import '@testing-library/jest-dom';
import { useMutation } from '@apollo/client/react';
import { MantineProvider } from '@mantine/core';
import {
  fireEvent,
  render as rtlRender,
  screen,
  waitFor,
} from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FavoriteButton from './FavoriteButton';

const { mockMutation, mockStart, mockShowError } = vi.hoisted(() => ({
  mockMutation: vi.fn(),
  mockStart: vi.fn().mockResolvedValue(undefined),
  mockShowError: vi.fn(),
}));

vi.mock('@apollo/client/react', () => ({ useMutation: vi.fn() }));
vi.mock('next-auth/react', () => ({ useSession: vi.fn() }));
vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));
vi.mock('@/utils/notifications', () => ({
  showErrorNotification: mockShowError,
}));
vi.mock('motion/react', () => ({
  motion: {
    span: ({ children, ...props }: React.ComponentProps<'span'>) => (
      <span {...props}>{children}</span>
    ),
  },
  useAnimationControls: () => ({ start: mockStart }),
}));
vi.mock('@tabler/icons-react', () => ({
  IconHeart: (props: React.ComponentProps<'svg'>) => (
    <svg data-testid="heart" {...props} />
  ),
  IconHeartFilled: (props: React.ComponentProps<'svg'>) => (
    <svg data-testid="heart-filled" {...props} />
  ),
}));

describe('FavoriteButton', () => {
  const render = (ui: React.ReactElement) =>
    rtlRender(<MantineProvider>{ui}</MantineProvider>);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: 'user-1' } },
      status: 'authenticated',
      update: vi.fn(),
    });
    vi.mocked(useMutation).mockImplementation(
      () => [mockMutation, { loading: false }] as never,
    );
  });

  it('renders nothing when the session has no user id', () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: {} },
      status: 'authenticated',
      update: vi.fn(),
    });

    render(<FavoriteButton recipeId="recipe-1" />);

    expect(screen.queryByTestId('favorite-button')).not.toBeInTheDocument();
  });

  it('adds a non-favorite and runs the burst animation on success', async () => {
    mockMutation.mockResolvedValue({
      data: { addToFavoriteRecipes: { success: true } },
    });
    render(<FavoriteButton recipeId="recipe-1" size="lg" />);

    const button = screen.getByTestId('favorite-button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(button);

    await waitFor(() =>
      expect(mockMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: { userId: 'user-1', recipeId: 'recipe-1' },
          awaitRefetchQueries: true,
        }),
      ),
    );
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(mockStart).toHaveBeenCalled();
  });

  it('removes a favorite and runs the simple animation on success', async () => {
    mockMutation.mockResolvedValue({
      data: { removeFromFavoriteRecipes: { success: true } },
    });
    render(<FavoriteButton recipeId="recipe-1" isFavorite />);

    const button = screen.getByTestId('favorite-button');
    fireEvent.click(button);

    await waitFor(() => expect(mockMutation).toHaveBeenCalled());
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('rolls back and translates a failed mutation response', async () => {
    mockMutation.mockResolvedValue({
      data: {
        addToFavoriteRecipes: { success: false, messageKey: 'response.denied' },
      },
    });
    render(<FavoriteButton recipeId="recipe-1" />);
    const button = screen.getByTestId('favorite-button');

    fireEvent.click(button);

    await waitFor(() =>
      expect(mockShowError).toHaveBeenCalledWith(
        'response.error',
        'response.denied',
      ),
    );
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('uses the unknown error fallback when a response has no message key', async () => {
    mockMutation.mockResolvedValue({
      data: { addToFavoriteRecipes: { success: false } },
    });
    render(<FavoriteButton recipeId="recipe-1" />);

    fireEvent.click(screen.getByTestId('favorite-button'));

    await waitFor(() =>
      expect(mockShowError).toHaveBeenCalledWith(
        'response.error',
        'response.unknownError',
      ),
    );
  });

  it('rolls back and reports an exception', async () => {
    mockMutation.mockRejectedValue(new Error('network failure'));
    render(<FavoriteButton recipeId="recipe-1" />);
    const button = screen.getByTestId('favorite-button');

    fireEvent.click(button);

    await waitFor(() =>
      expect(mockShowError).toHaveBeenCalledWith(
        'response.error',
        'response.somethingWentWrong',
      ),
    );
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('blocks toggling while a mutation is loading', () => {
    vi.mocked(useMutation).mockImplementation(
      () => [mockMutation, { loading: true }] as never,
    );
    render(<FavoriteButton recipeId="recipe-1" />);

    fireEvent.click(screen.getByTestId('favorite-button'));

    expect(mockMutation).not.toHaveBeenCalled();
  });
});
