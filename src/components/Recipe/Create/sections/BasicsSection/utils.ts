export const toNonNegativeNumberOrEmpty = (value: string): number | '' => {
  if (value === '') {
    return '';
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return '';
  }

  return parsedValue;
};
