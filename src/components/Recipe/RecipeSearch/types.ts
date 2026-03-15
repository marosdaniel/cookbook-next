export interface RecipeSearchFilters {
  title: string;
  categoryKey: string | null;
  difficultyLevelKey: string | null;
  labelKeys: string[];
  maxCookingTime: number | '';
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface RecipeSearchProps {
  onSearch: (filters: RecipeSearchFilters) => void;
  initialFilters?: RecipeSearchFilters;
  categoryOptions?: SelectOption[];
  difficultyOptions?: SelectOption[];
  labelOptions?: SelectOption[];
  loading?: boolean;
}

// Key for a filter field in `RecipeSearchFilters`
export type FilterKey = keyof RecipeSearchFilters;

// Allowed runtime values for filter fields
export type FilterValue = string | string[] | number | null;
