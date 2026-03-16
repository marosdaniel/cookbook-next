export function extractYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.slice(1);
    }
    return parsed.searchParams.get('v');
  } catch {
    return null;
  }
}

export function getDifficultyColor(key: string) {
  if (key === 'medium') return 'yellow';
  if (key === 'hard') return 'red';
  return 'green';
}

export function scaleQuantity(quantity: number, multiplier: number): number {
  return +(quantity * multiplier).toFixed(2);
}

export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}
