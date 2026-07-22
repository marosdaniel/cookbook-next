import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ComposerSidebar from './ComposerSidebar';

vi.mock('@mantine/core', () => ({
  Box: ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => (
    <div {...props}>{children}</div>
  ),
  Button: ({
    children,
    ...props
  }: React.ComponentPropsWithoutRef<'button'>) => (
    <button {...props}>{children}</button>
  ),
  Divider: (props: React.ComponentPropsWithoutRef<'div'>) => <div {...props} />,
  Group: ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => (
    <div {...props}>{children}</div>
  ),
  Progress: (props: React.ComponentPropsWithoutRef<'div'>) => (
    <div {...props} />
  ),
  Stack: ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => (
    <div {...props}>{children}</div>
  ),
  Text: ({ children, ...props }: React.ComponentPropsWithoutRef<'p'>) => (
    <p {...props}>{children}</p>
  ),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (key === 'itemsCount') return `items:${values?.count}`;
    if (key === 'stepsCount') return `steps:${values?.count}`;
    if (key === 'mediaCoverSet') return 'media:set';
    if (key === 'mediaOptional') return 'media:optional';
    if (key === 'fieldsFilled')
      return `fields:${values?.completed}/${values?.total}`;
    return key;
  },
}));

vi.mock('../SectionNavItem', () => ({
  default: ({
    label,
    hint,
    onClick,
    active,
  }: {
    label: string;
    hint: string;
    onClick: () => void;
    active: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      data-testid={`mock-section-${label.toLowerCase()}`}
    >
      {label}:{hint}:{active ? 'active' : 'inactive'}
    </button>
  ),
}));

describe('ComposerSidebar', () => {
  it('renders the sidebar and triggers quick actions', () => {
    const onSectionChange = vi.fn();
    const onAddIngredient = vi.fn();
    const onAddStep = vi.fn();
    const onReset = vi.fn();

    render(
      <ComposerSidebar
        activeSection="basics"
        onSectionChange={onSectionChange}
        values={
          {
            title: 'Recipe',
            description: 'Story',
            imgSrc: '',
            servings: 4,
            cookingTime: 30,
            difficultyLevel: { value: 'easy', label: 'Easy' },
            category: { value: 'dessert', label: 'Dessert' },
            labels: [],
            youtubeLink: '',
            ingredients: [],
            preparationSteps: [],
            prepTimeMinutes: 10,
            cookTimeMinutes: 15,
            restTimeMinutes: 5,
            servingUnit: null,
            cuisine: null,
            dietaryFlags: [],
            allergens: [],
            equipment: [],
            costLevel: null,
            tips: '',
            substitutions: '',
            slug: '',
            seoTitle: '',
            seoDescription: '',
            socialImage: '',
          } as never
        }
        completion={{ done: 2, total: 6, percent: 33 }}
        onAddIngredient={onAddIngredient}
        onAddStep={onAddStep}
        onReset={onReset}
        resetLabel="Reset draft"
      />,
    );

    expect(screen.getByTestId('recipe-composer-sidebar')).toBeInTheDocument();

    fireEvent.click(
      screen.getByTestId('recipe-composer-sidebar-quick-add-ingredient'),
    );
    fireEvent.click(
      screen.getByTestId('recipe-composer-sidebar-quick-add-step'),
    );
    fireEvent.click(screen.getByTestId('recipe-composer-sidebar-reset'));

    expect(onSectionChange).toHaveBeenCalledWith('ingredients');
    expect(onSectionChange).toHaveBeenCalledWith('steps');
    expect(onAddIngredient).toHaveBeenCalledTimes(1);
    expect(onAddStep).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('shows section hints for the different section states', () => {
    render(
      <ComposerSidebar
        activeSection="media"
        onSectionChange={vi.fn()}
        values={
          {
            title: 'Recipe',
            description: 'Story',
            imgSrc: 'cover.jpg',
            servings: 4,
            cookingTime: 30,
            difficultyLevel: { value: 'easy', label: 'Easy' },
            category: { value: 'dessert', label: 'Dessert' },
            labels: [],
            youtubeLink: '',
            ingredients: [
              {
                localId: '1',
                name: 'Salt',
                quantity: 1,
                unit: null,
                isOptional: false,
                note: '',
              },
            ],
            preparationSteps: [{ localId: 's1', description: 'Mix', order: 1 }],
            prepTimeMinutes: 10,
            cookTimeMinutes: 15,
            restTimeMinutes: 5,
            servingUnit: null,
            cuisine: null,
            dietaryFlags: [],
            allergens: [],
            equipment: [],
            costLevel: null,
            tips: '',
            substitutions: '',
            slug: '',
            seoTitle: '',
            seoDescription: '',
            socialImage: '',
          } as never
        }
        completion={{ done: 5, total: 6, percent: 83 }}
        onAddIngredient={vi.fn()}
        onAddStep={vi.fn()}
        onReset={vi.fn()}
        resetLabel="Reset"
      />,
    );

    expect(screen.getByText(/items:1/i)).toBeInTheDocument();
    expect(screen.getByText(/steps:1/i)).toBeInTheDocument();
    expect(screen.getByText(/media:set/i)).toBeInTheDocument();
    expect(screen.getByText(/fields:6\/6/i)).toBeInTheDocument();
  });
});
