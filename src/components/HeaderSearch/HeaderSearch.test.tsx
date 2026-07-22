import '@testing-library/jest-dom';
import type { ChangeEvent, ComponentProps, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PUBLIC_ROUTES } from '@/types/routes';
import { fireEvent, render, screen } from '@/utils/test-utils';
import { HeaderSearch } from './HeaderSearch';

const mockPush = vi.fn();
const mockOpenDropdown = vi.fn();
const mockCloseDropdown = vi.fn();
const mockResetSelectedOption = vi.fn();
const mockUseQuery = vi.fn();

vi.mock('@apollo/client/react', () => ({
  useQuery: () => mockUseQuery(),
}));

vi.mock('@mantine/hooks', () => ({
  useDebouncedValue: (value: string) => [value],
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) =>
    ({
      placeholder: 'Search recipes',
      searching: 'Searching...',
      searchError: 'Search error',
      noResults: 'No results',
    })[key] || key,
}));

vi.mock('@tabler/icons-react', () => ({
  IconSearch: () => <svg data-testid="search-icon" />,
}));

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    span: ({ children, ...props }: ComponentProps<'span'>) => (
      <span {...props}>{children}</span>
    ),
    div: ({ children, ...props }: ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

vi.mock('@mantine/core', async () => {
  const actual =
    await vi.importActual<typeof import('@mantine/core')>('@mantine/core');
  let activeOnOptionSubmit: ((value: string) => void) | undefined;

  const ComboboxRoot = ({
    children,
    onOptionSubmit,
  }: {
    children: ReactNode;
    onOptionSubmit?: (value: string) => void;
  }) => {
    activeOnOptionSubmit = onOptionSubmit;

    return <div data-testid="combobox-root">{children}</div>;
  };

  const Target = ({ children }: { children: ReactNode }) => (
    <div data-testid="combobox-target">{children}</div>
  );

  const Dropdown = ({ children, ...props }: ComponentProps<'div'>) => (
    <div {...props}>{children}</div>
  );

  const Options = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
  const Empty = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
  const Option = ({
    value,
    children,
    ...props
  }: ComponentProps<'button'> & {
    value: string;
  }) => (
    <button
      type="button"
      onClick={() => activeOnOptionSubmit?.(value)}
      {...props}
    >
      {children}
    </button>
  );

  const Combobox = Object.assign(ComboboxRoot, {
    Target,
    Dropdown,
    Options,
    Empty,
    Option,
  });

  return {
    ...actual,
    Combobox,
    Group: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Loader: () => <div data-testid="loader" />,
    Text: ({ children, ...props }: ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
    TextInput: ({
      value,
      onChange,
      onFocus,
      onBlur,
      rightSection,
      ...props
    }: ComponentProps<'input'> & {
      rightSection?: ReactNode;
    }) => (
      <label>
        <input
          value={value}
          onChange={(event) =>
            onChange?.(event as ChangeEvent<HTMLInputElement>)
          }
          onFocus={onFocus}
          onBlur={onBlur}
          {...props}
        />
        {rightSection}
      </label>
    ),
    useCombobox: () => ({
      openDropdown: mockOpenDropdown,
      closeDropdown: mockCloseDropdown,
      resetSelectedOption: mockResetSelectedOption,
    }),
  };
});

describe('HeaderSearch', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockOpenDropdown.mockReset();
    mockCloseDropdown.mockReset();
    mockResetSelectedOption.mockReset();
    mockUseQuery.mockReset();
  });

  it('renders the search input and idle state by default', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined,
    });

    render(<HeaderSearch />);

    expect(screen.getByTestId('header-search-input')).toBeInTheDocument();
    expect(screen.getByTestId('header-search-dropdown')).toBeInTheDocument();
  });

  it('shows the loading status when a search is in progress', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });

    render(<HeaderSearch />);

    expect(screen.getByTestId('header-search-loading')).toBeInTheDocument();
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('shows the error status when the query fails', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error('boom'),
    });

    render(<HeaderSearch />);

    expect(screen.getByTestId('header-search-error')).toBeInTheDocument();
    expect(screen.getByText('Search error')).toBeInTheDocument();
  });

  it('shows the empty state when no recipes match the query', () => {
    mockUseQuery.mockReturnValue({
      data: { getRecipes: { recipes: [] } },
      loading: false,
      error: undefined,
    });

    render(<HeaderSearch />);

    fireEvent.change(screen.getByTestId('header-search-input'), {
      target: { value: 'carrot' },
    });

    expect(screen.getByTestId('header-search-empty')).toBeInTheDocument();
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('opens the dropdown and renders recipe options when results are returned', () => {
    mockUseQuery.mockReturnValue({
      data: {
        getRecipes: {
          recipes: [
            { id: 'recipe-1', slug: 'carrot-soup', title: 'Carrot Soup' },
          ],
        },
      },
      loading: false,
      error: undefined,
    });

    render(<HeaderSearch />);

    fireEvent.change(screen.getByTestId('header-search-input'), {
      target: { value: 'carrot' },
    });

    expect(mockOpenDropdown).toHaveBeenCalled();
    expect(screen.getByTestId('header-search-results')).toBeInTheDocument();
    expect(screen.getByText('Carrot Soup')).toBeInTheDocument();
  });

  it('navigates to the selected recipe when an option is submitted', () => {
    mockUseQuery.mockReturnValue({
      data: {
        getRecipes: {
          recipes: [
            { id: 'recipe-1', slug: 'carrot-soup', title: 'Carrot Soup' },
          ],
        },
      },
      loading: false,
      error: undefined,
    });

    render(<HeaderSearch />);

    fireEvent.click(screen.getByRole('button', { name: 'Carrot Soup' }));

    expect(mockPush).toHaveBeenCalledWith(
      `${PUBLIC_ROUTES.RECIPES}/carrot-soup`,
    );
  });
});
