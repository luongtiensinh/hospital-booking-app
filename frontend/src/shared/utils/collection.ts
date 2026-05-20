export function ensureArray<T>(value: T[] | { items?: T[] } | undefined | null): T[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && Array.isArray(value.items)) {
    return value.items;
  }

  return [];
}
