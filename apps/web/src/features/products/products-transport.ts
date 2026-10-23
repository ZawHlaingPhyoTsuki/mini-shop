import "server-only";

import { apiRequest } from "@/lib/api";
import type { Product } from "./types/product";

export const productsTransport = {
  getPublicProducts(query?: { search?: string; categorySlug?: string; categoryId?: string }) {
    const params = new URLSearchParams();
    if (query?.search) params.set("search", query.search);
    if (query?.categorySlug) params.set("category", query.categorySlug);
    if (query?.categoryId) params.set("categoryId", query.categoryId);
    const qs = params.toString();
    return apiRequest<Product[]>(`/products${qs ? `?${qs}` : ""}`);
  },

  getPublicProduct(slug: string, shopSlug?: string) {
    const params = new URLSearchParams();
    if (shopSlug) params.set("shop", shopSlug);
    const qs = params.toString();
    return apiRequest<Product>(`/products/${encodeURIComponent(slug)}${qs ? `?${qs}` : ""}`);
  },

  getMerchantProducts() {
    return apiRequest<Product[]>("/merchant/products", undefined, true);
  },

  createProduct(input: {
    nameEn: string;
    nameMy?: string;
    descriptionEn?: string;
    descriptionMy?: string;
    slug: string;
    categoryId?: string;
    priceMMK: number;
    priceTHB?: number;
    stockQuantity?: number | null;
    sku?: string;
  }) {
    return apiRequest<Product>(
      "/merchant/products",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
      true,
    );
  },

  updateProduct(
    id: string,
    input: {
      nameEn?: string;
      nameMy?: string;
      descriptionEn?: string;
      descriptionMy?: string;
      categoryId?: string;
      priceMMK?: number;
      priceTHB?: number;
      stockQuantity?: number | null;
      sku?: string;
      status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    },
  ) {
    return apiRequest<Product>(
      `/merchant/products/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
      true,
    );
  },
};
