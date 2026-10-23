export const withPlaceCount = { _count: { select: { places: true } } } as const;

type WithPlaceCount = { _count: { places: number } };

export function toAdminItem<T extends WithPlaceCount>(
  item: T,
): Omit<T, "_count"> & { placeCount: number } {
  const { _count, ...rest } = item;
  return { ...rest, placeCount: _count.places };
}
