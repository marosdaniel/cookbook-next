import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    recipe: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findFirstOrThrow: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    rating: { upsert: vi.fn(), delete: vi.fn() },
    $queryRaw: vi.fn(),
  },
}));

vi.mock('@/lib/prisma/prisma', () => ({ prisma: prismaMock }));

import { buildWhereClause, RecipeRepository } from './repository';

describe('buildWhereClause', () => {
  it('returns an empty clause when no filter is given', () => {
    expect(buildWhereClause()).toEqual({});
    expect(buildWhereClause(undefined)).toEqual({});
  });

  it('maps every scalar JSON key filter', () => {
    expect(
      buildWhereClause({
        categoryKey: 'soup',
        difficultyLevelKey: 'easy',
        cuisineKey: 'hu',
        costLevelKey: 'low',
        maxCookingTime: 30,
      }),
    ).toEqual({
      category: { path: ['key'], equals: 'soup' },
      difficultyLevel: { path: ['key'], equals: 'easy' },
      cuisine: { path: ['key'], equals: 'hu' },
      costLevel: { path: ['key'], equals: 'low' },
      cookingTime: { lte: 30 },
    });
  });

  it('maps array filters to array_contains and ignores empty arrays', () => {
    expect(
      buildWhereClause({
        labelKeys: ['quick'],
        dietaryFlagKeys: ['vegan'],
        allergenKeys: ['gluten'],
        equipmentKeys: ['oven', 'pan'],
      }),
    ).toEqual({
      labels: { array_contains: [{ key: 'quick' }] },
      dietaryFlags: { array_contains: [{ key: 'vegan' }] },
      allergens: { array_contains: [{ key: 'gluten' }] },
      equipment: { array_contains: [{ key: 'oven' }, { key: 'pan' }] },
    });

    expect(buildWhereClause({ labelKeys: [], allergenKeys: [] })).toEqual({});
  });
});

describe('RecipeRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('findSlugConflict excludes the current recipe when an id is given', async () => {
    await RecipeRepository.findSlugConflict('soup', 'r1');

    expect(prismaMock.recipe.findFirst).toHaveBeenLastCalledWith({
      where: {
        slug: { equals: 'soup', mode: 'insensitive' },
        id: { not: 'r1' },
      },
      select: { id: true },
    });
  });

  it('findSlugConflict checks all recipes when no id is excluded', async () => {
    await RecipeRepository.findSlugConflict('soup');

    expect(prismaMock.recipe.findFirst).toHaveBeenLastCalledWith({
      where: { slug: { equals: 'soup', mode: 'insensitive' } },
      select: { id: true },
    });
  });

  it('searchPaginatedByTrigram executes the generated raw query', async () => {
    prismaMock.$queryRaw.mockResolvedValue([
      { id: 'r1', score: 0.5, totalCount: 1 },
    ]);

    const rows = await RecipeRepository.searchPaginatedByTrigram({
      searchTerm: 'soup',
      take: 10,
    });

    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1);
    expect(rows).toEqual([{ id: 'r1', score: 0.5, totalCount: 1 }]);
  });

  it('findManyListByIds returns an empty array without querying when there are no ids', async () => {
    await expect(RecipeRepository.findManyListByIds([])).resolves.toEqual([]);
    expect(prismaMock.recipe.findMany).not.toHaveBeenCalled();
  });

  it('findManyListByIds keeps the order of the requested ids and drops missing rows', async () => {
    prismaMock.recipe.findMany.mockResolvedValue([
      { id: 'b', title: 'B' },
      { id: 'a', title: 'A' },
    ]);

    const items = await RecipeRepository.findManyListByIds([
      'a',
      'missing',
      'b',
    ]);

    expect(items).toEqual([
      { id: 'a', title: 'A' },
      { id: 'b', title: 'B' },
    ]);
  });

  it('findManyListAndCount applies take only when it is set', async () => {
    prismaMock.recipe.findMany.mockResolvedValue([]);
    prismaMock.recipe.count.mockResolvedValue(0);

    await RecipeRepository.findManyListAndCount({
      where: {},
      countWhere: {},
      take: 5,
    });
    await RecipeRepository.findManyListAndCount({ where: {}, countWhere: {} });

    expect(prismaMock.recipe.findMany.mock.calls[0][0]).toHaveProperty(
      'take',
      5,
    );
    expect(prismaMock.recipe.findMany.mock.calls[1][0]).not.toHaveProperty(
      'take',
    );
  });

  it('findByAuthorIdAndCount filters by author and applies an optional take', async () => {
    prismaMock.recipe.findMany.mockResolvedValue([]);
    prismaMock.recipe.count.mockResolvedValue(0);

    await RecipeRepository.findByAuthorIdAndCount('u1', 4);
    await RecipeRepository.findByAuthorIdAndCount('u1');

    expect(prismaMock.recipe.count).toHaveBeenCalledWith({
      where: { createdBy: 'u1' },
    });
    expect(prismaMock.recipe.findMany.mock.calls[0][0]).toMatchObject({
      where: { createdBy: 'u1' },
      take: 4,
    });
    expect(prismaMock.recipe.findMany.mock.calls[1][0]).not.toHaveProperty(
      'take',
    );
  });

  it('createWithRelations maps ingredient defaults and step ordering', async () => {
    prismaMock.recipe.create.mockResolvedValue({ id: 'r1' });

    await RecipeRepository.createWithRelations(
      'u1',
      { title: 'Soup' } as never,
      [
        { localId: 'i1', name: 'Salt', quantity: 1, unit: 'g' } as never,
        {
          localId: 'i2',
          name: 'Pepper',
          quantity: 2,
          unit: 'g',
          isOptional: true,
          note: 'fresh',
        } as never,
      ],
      [
        { description: 'Boil', order: 0 } as never,
        { description: 'Serve', order: 2 } as never,
      ],
    );

    const args = prismaMock.recipe.create.mock.calls[0][0];
    expect(args.data.createdBy).toBe('u1');
    expect(args.data.ingredients.create).toEqual([
      {
        localId: 'i1',
        name: 'Salt',
        quantity: 1,
        unit: 'g',
        isOptional: false,
        note: null,
      },
      {
        localId: 'i2',
        name: 'Pepper',
        quantity: 2,
        unit: 'g',
        isOptional: true,
        note: 'fresh',
      },
    ]);
    expect(args.data.preparationSteps.create).toEqual([
      { description: 'Boil', order: 1 },
      { description: 'Serve', order: 2 },
    ]);
  });

  it('updateWithRelations replaces existing ingredients and steps', async () => {
    prismaMock.recipe.update.mockResolvedValue({ id: 'r1' });

    await RecipeRepository.updateWithRelations(
      'r1',
      { title: 'Soup v2' } as never,
      [{ localId: 'i1', name: 'Salt', quantity: 1, unit: 'g' } as never],
      [{ description: 'Boil', order: 1 } as never],
    );

    const args = prismaMock.recipe.update.mock.calls[0][0];
    expect(args.where).toEqual({ id: 'r1' });
    expect(args.data.ingredients.deleteMany).toEqual({});
    expect(args.data.preparationSteps.deleteMany).toEqual({});
    expect(args.data.ingredients.create).toHaveLength(1);
    expect(args.data.preparationSteps.create).toEqual([
      { description: 'Boil', order: 1 },
    ]);
  });

  it('deleteById, upsertRating and deleteRating use the expected keys', async () => {
    await RecipeRepository.deleteById('r1');
    await RecipeRepository.upsertRating('r1', 'u1', 5);
    await RecipeRepository.deleteRating('r1', 'u1');

    expect(prismaMock.recipe.delete).toHaveBeenCalledWith({
      where: { id: 'r1' },
    });
    expect(prismaMock.rating.upsert).toHaveBeenCalledWith({
      where: { recipeId_userId: { recipeId: 'r1', userId: 'u1' } },
      update: { ratingValue: 5 },
      create: { recipeId: 'r1', userId: 'u1', ratingValue: 5 },
    });
    expect(prismaMock.rating.delete).toHaveBeenCalledWith({
      where: { recipeId_userId: { recipeId: 'r1', userId: 'u1' } },
    });
  });

  it('findBySlugOrIdWithAuthor matches either slug or id and includes the author', async () => {
    await RecipeRepository.findBySlugOrIdWithAuthor('soup');

    expect(prismaMock.recipe.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { OR: [{ slug: 'soup' }, { id: 'soup' }] },
        include: expect.objectContaining({
          author: {
            select: { userName: true, firstName: true, lastName: true },
          },
        }),
      }),
    );
  });
});
