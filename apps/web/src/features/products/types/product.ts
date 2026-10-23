export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "HIDDEN";

export type Product = {
  id: string;
  shopId: string;
  categoryId: string | null;
  nameEn: string;
  nameMy: string | null;
  descriptionEn: string | null;
  descriptionMy: string | null;
  slug: string;
  priceMMK: number;
  priceTHB: number | null;
  status: ProductStatus;
  publishedAt: string | null;
  stockQuantity: number | null;
  sku: string | null;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    slug: string;
    nameEn: string;
    nameMy: string | null;
  } | null;
  shop?: {
    id: string;
    name: string;
    slug: string;
    logoObjectKey?: string | null;
    contactPhone?: string | null;
  };
};
