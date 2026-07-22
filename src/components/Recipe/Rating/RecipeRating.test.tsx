import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Group,
  Rating,
  Stack,
  Text,
} from '../../../../__mocks__/@mantine/core';
import RecipeRating from './RecipeRating';

const { mockUseTranslations, mockShow, mockUseMutation } = vi.hoisted(() => ({
  mockUseTranslations: vi.fn(
    (namespace?: string) => (key: string) => `${namespace}:${key}`,
  ),
  mockShow: vi.fn(),
  mockUseMutation: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => mockUseTranslations(namespace),
}));

vi.mock('@apollo/client/react', () => ({
  useMutation: () => mockUseMutation(),
}));

vi.mock('@mantine/notifications', () => ({
  notifications: { show: mockShow },
}));

vi.mock('@mantine/core', () => ({
  Group: Group,
  Rating: Rating,
  Stack: Stack,
  Text: Text,
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children?: ReactNode;
      [key: string]: unknown;
    }) => <div {...props}>{children}</div>,
  },
}));

const renderComponent = (
  props?: Partial<ComponentProps<typeof RecipeRating>>,
) =>
  render(
    <RecipeRating
      recipeId="recipe-1"
      userRating={null}
      averageRating={4.5}
      ratingsCount={12}
      {...props}
    />,
  );

describe('RecipeRating', () => {
  beforeEach(() => {
    mockShow.mockReset();
    mockUseMutation.mockReset();
    mockUseMutation.mockReturnValue([
      vi.fn().mockResolvedValue({}),
      { loading: false },
    ]);
  });

  it('renders the rating summary and count', () => {
    renderComponent();

    expect(screen.getByTestId('recipe-rating')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-rating-control')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-rating-count')).toHaveTextContent(
      '(12 recipe:ratingsCount)',
    );
  });

  it('shows the user rating text when a user rating exists', () => {
    renderComponent({ userRating: 5 });

    expect(screen.getByTestId('recipe-rating-user-rating')).toHaveTextContent(
      'recipe:yourRating: 5',
    );
  });

  it('does not call the mutation when readOnly is true', async () => {
    const mutate = vi.fn().mockResolvedValue({});
    mockUseMutation.mockReturnValue([mutate, { loading: false }]);

    renderComponent({ readOnly: true });
    fireEvent.change(screen.getByTestId('recipe-rating-control'), {
      target: { value: '4' },
    });

    await waitFor(() => {
      expect(mutate).not.toHaveBeenCalled();
    });
  });

  it('submits a rating and shows success notification', async () => {
    const mutate = vi.fn().mockResolvedValue({});
    mockUseMutation.mockReturnValue([mutate, { loading: false }]);

    renderComponent();
    fireEvent.change(screen.getByTestId('recipe-rating-control'), {
      target: { value: '4' },
    });

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            ratingInput: {
              recipeId: 'recipe-1',
              ratingValue: 4,
            },
          },
        }),
      );
    });

    await waitFor(() => {
      expect(mockShow).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'recipe:ratingSuccess',
          color: 'green',
        }),
      );
    });
  });

  it('shows an error notification when the mutation fails', async () => {
    const mutate = vi.fn().mockRejectedValue(new Error('boom'));
    mockUseMutation.mockReturnValue([mutate, { loading: false }]);

    renderComponent();
    fireEvent.change(screen.getByTestId('recipe-rating-control'), {
      target: { value: '4' },
    });

    await waitFor(() => {
      expect(mockShow).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'recipe:ratingError',
          color: 'red',
        }),
      );
    });
  });

  it('skips mutation while loading', async () => {
    const mutate = vi.fn().mockResolvedValue({});
    mockUseMutation.mockReturnValue([mutate, { loading: true }]);

    renderComponent();
    fireEvent.change(screen.getByTestId('recipe-rating-control'), {
      target: { value: '4' },
    });

    await waitFor(() => {
      expect(mutate).not.toHaveBeenCalled();
    });
  });
});
