export type Category = {
  id: string;
  slug: string;
  nameMy: string;
  nameEn: string | null;
};

export type AdminCategory = Category & {
  placeCount: number;
};
