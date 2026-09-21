export function parseDelimitedQueryParam<T extends string>(
  value: string | null,
  allowedValues: readonly T[],
): T[] {
  const allowed = new Set<string>(allowedValues);

  return [
    ...new Set(
      (value ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter((item): item is T => allowed.has(item)),
    ),
  ];
}
