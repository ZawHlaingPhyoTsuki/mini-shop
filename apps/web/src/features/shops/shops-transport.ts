import "server-only";

import { apiRequest, ApiTransportError } from "@/lib/api";
import type { AdminShop, Shop } from "./types/shop";

export const shopsTransport = {
  async getMyShop(): Promise<Shop | null> {
    try {
      return await apiRequest<Shop>("/shops/me", undefined, true);
    } catch (err) {
      if (err instanceof ApiTransportError && (err.status === 404 || err.status === 403)) {
        return null;
      }
      throw err;
    }
  },

  getPublicShop(slug: string) {
    return apiRequest<Shop & { products: any[] }>(`/shops/${encodeURIComponent(slug)}`);
  },

  createShop(input: {
    name: string;
    slug: string;
    descriptionEn?: string;
    descriptionMy?: string;
    contactPhone?: string;
    socialLinks?: Record<string, string>;
  }) {
    return apiRequest<Shop>(
      "/shops",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
      true,
    );
  },

  updateMyShop(input: {
    name?: string;
    descriptionEn?: string;
    descriptionMy?: string;
    contactPhone?: string;
    socialLinks?: Record<string, string>;
  }) {
    return apiRequest<Shop>(
      "/shops/me",
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
      true,
    );
  },

  resubmitMyShop() {
    return apiRequest<Shop>(
      "/shops/me/submit",
      {
        method: "POST",
      },
      true,
    );
  },

  getAdminShops() {
    return apiRequest<AdminShop[]>("/admin/shops", undefined, true);
  },

  approveShop(id: string, reviewNote?: string) {
    return apiRequest<Shop>(
      `/admin/shops/${id}/approve`,
      {
        method: "POST",
        body: JSON.stringify({ reviewNote }),
      },
      true,
    );
  },

  rejectShop(id: string, reviewNote: string) {
    return apiRequest<Shop>(
      `/admin/shops/${id}/reject`,
      {
        method: "POST",
        body: JSON.stringify({ reviewNote }),
      },
      true,
    );
  },
};
