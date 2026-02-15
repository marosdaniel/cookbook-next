import { describe, expect, it } from 'vitest';
import type { RecipeFormValues, TMetadataCleaned } from './types';
import {
  computeCompletion,
  getProgressColor,
  getStatusColor,
  sectionCompletion,
  toCleanedOptions,
  transformValuesToInput,
} from './utils';

// Mock data
const mockRecipeFormValues: RecipeFormValues = {
  title: 'Test Recipe',
  description: 'Test description',
  imgSrc: 'test.jpg',
  servings: 4,
  cookingTime: 30,
  difficultyLevel: { value: 'easy', label: 'Easy' },
  category: { value: 'main', label: 'Main Course' },
  labels: ['vegetarian'],
  youtubeLink: 'https://youtube.com/test',
  ingredients: [
    { localId: '1', name: 'Flour', quantity: 200, unit: 'g' },
    { localId: '2', name: 'Eggs', quantity: 2, unit: 'pcs' },
  ],
  preparationSteps: [
    { localId: '1', description: 'Mix ingredients', order: 1 },
    { localId: '2', description: 'Bake', order: 2 },
  ],
};

const mockLabels: TMetadataCleaned[] = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'gluten-free', label: 'Gluten Free' },
];

describe('computeCompletion', () => {
  it('should return 100% completion for fully filled form', () => {
    const result = computeCompletion(mockRecipeFormValues);
    expect(result.done).toBe(8);
    expect(result.total).toBe(8);
    expect(result.percent).toBe(100);
  });

  it('should return 0% completion for empty form', () => {
    const emptyValues: RecipeFormValues = {
      title: '',
      description: '',
      imgSrc: '',
      servings: '',
      cookingTime: '',
      difficultyLevel: null,
      category: null,
      labels: [],
      youtubeLink: '',
      ingredients: [],
      preparationSteps: [],
    };
    const result = computeCompletion(emptyValues);
    expect(result.done).toBe(0);
    expect(result.total).toBe(8);
    expect(result.percent).toBe(0);
  });

  it('should calculate partial completion correctly', () => {
    const partialValues: RecipeFormValues = {
      ...mockRecipeFormValues,
      description: '',
      ingredients: [],
    };
    const result = computeCompletion(partialValues);
    expect(result.done).toBe(6);
    expect(result.total).toBe(8);
    expect(result.percent).toBe(75);
  });
});

describe('sectionCompletion', () => {
  it('should calculate basics section completion', () => {
    const result = sectionCompletion('basics', mockRecipeFormValues);
    expect(result.done).toBe(6);
    expect(result.total).toBe(6);
  });

  it('should calculate media section completion', () => {
    const result = sectionCompletion('media', mockRecipeFormValues);
    expect(result.done).toBe(1);
    expect(result.total).toBe(1);
  });

  it('should calculate ingredients section completion', () => {
    const result = sectionCompletion('ingredients', mockRecipeFormValues);
    expect(result.done).toBe(2);
    expect(result.total).toBe(2);
  });

  it('should calculate steps section completion', () => {
    const result = sectionCompletion('steps', mockRecipeFormValues);
    expect(result.done).toBe(2);
    expect(result.total).toBe(2);
  });

  it('should handle empty ingredients', () => {
    const values = { ...mockRecipeFormValues, ingredients: [] };
    const result = sectionCompletion('ingredients', values);
    expect(result.done).toBe(0);
    expect(result.total).toBe(1);
  });

  it('should handle empty steps', () => {
    const values = { ...mockRecipeFormValues, preparationSteps: [] };
    const result = sectionCompletion('steps', values);
    expect(result.done).toBe(0);
    expect(result.total).toBe(1);
  });
});

describe('toCleanedOptions', () => {
  it('should transform items without translation function', () => {
    const items = [
      { key: 'easy', label: 'Easy' },
      { key: 'hard', label: 'Hard' },
    ];
    const result = toCleanedOptions(items);
    expect(result).toEqual([
      { value: 'easy', label: 'Easy' },
      { value: 'hard', label: 'Hard' },
    ]);
  });

  it('should transform items with translation function', () => {
    const items = [
      { key: 'easy', label: 'Easy' },
      { key: 'hard', label: 'Hard' },
    ];
    const t = (key: string) => (key === 'easy' ? 'Könnyű' : key);
    const result = toCleanedOptions(items, t);
    expect(result).toEqual([
      { value: 'easy', label: 'Könnyű' },
      { value: 'hard', label: 'Hard' },
    ]);
  });
});

describe('transformValuesToInput', () => {
  it('should transform form values to input format', () => {
    const result = transformValuesToInput(mockRecipeFormValues, mockLabels);
    expect(result).toEqual({
      title: 'Test Recipe',
      description: 'Test description',
      imgSrc: 'test.jpg',
      cookingTime: 30,
      servings: 4,
      difficultyLevel: { value: 'easy', label: 'Easy' },
      category: { value: 'main', label: 'Main Course' },
      labels: [{ value: 'vegetarian', label: 'Vegetarian' }],
      youtubeLink: 'https://youtube.com/test',
      ingredients: [
        { localId: '1', name: 'Flour', quantity: 200, unit: 'g' },
        { localId: '2', name: 'Eggs', quantity: 2, unit: 'pcs' },
      ],
      preparationSteps: [
        { description: 'Mix ingredients', order: 1 },
        { description: 'Bake', order: 2 },
      ],
    });
  });

  it('should handle null difficultyLevel and category', () => {
    const values = {
      ...mockRecipeFormValues,
      difficultyLevel: null,
      category: null,
    };
    const result = transformValuesToInput(values, mockLabels);
    expect(result.difficultyLevel).toEqual({ value: '', label: '' });
    expect(result.category).toEqual({ value: '', label: '' });
  });

  it('should handle missing labels', () => {
    const values = { ...mockRecipeFormValues, labels: ['nonexistent'] };
    const result = transformValuesToInput(values, mockLabels);
    expect(result.labels).toEqual([
      { value: 'nonexistent', label: 'nonexistent' },
    ]);
  });
});

describe('getProgressColor', () => {
  it('should return teal for 100%', () => {
    expect(getProgressColor(100)).toBe('teal');
  });

  it('should return blue for >50%', () => {
    expect(getProgressColor(75)).toBe('blue');
  });

  it('should return orange for <=50%', () => {
    expect(getProgressColor(50)).toBe('orange');
    expect(getProgressColor(25)).toBe('orange');
  });
});

describe('getStatusColor', () => {
  it('should return green for complete', () => {
    expect(getStatusColor(true, false)).toBe('green');
  });

  it('should return blue for active but not complete', () => {
    expect(getStatusColor(false, true)).toBe('blue');
  });

  it('should return gray for inactive and not complete', () => {
    expect(getStatusColor(false, false)).toBe('gray');
  });
});
