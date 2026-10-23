export type Category = {
  id: string;
  slug: string;
  nameEn: string;
  nameMy: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type AdminCategory = Category & {
  productCount: number;
};
