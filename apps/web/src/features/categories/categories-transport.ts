import "server-only";

import { apiRequest } from "@/lib/api";

import type { AdminCategory, Category } from "./types/category";

export const categoriesTransport = {
  getCategories() {
    return apiRequest<Category[]>("/categories");
  },

  getAdminCategories() {
    return apiRequest<AdminCategory[]>("/admin/categories", undefined, true);
  },

  createCategory(input: {
    slug: string;
    nameEn: string;
    nameMy?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    return apiRequest<AdminCategory>(
      "/admin/categories",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
      true,
    );
  },

  updateCategory(
    id: string,
    input: {
      nameEn?: string;
      nameMy?: string;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    return apiRequest<AdminCategory>(
      `/admin/categories/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
      true,
    );
  },

  deleteCategory(id: string) {
    return apiRequest<{ deleted: true }>(
      `/admin/categories/${id}`,
      {
        method: "DELETE",
      },
      true,
    );
  },
};
