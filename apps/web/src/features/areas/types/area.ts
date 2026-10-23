export type Area = {
  id: string;
  slug: string;
  nameMy: string;
  nameEn: string | null;
  sortOrder: number;
};

export type AdminArea = Area & {
  placeCount: number;
};
