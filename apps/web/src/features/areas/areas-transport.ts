import "server-only";

import { apiRequest } from "@/lib/api";

import type { AdminArea, Area } from "./types/area";

export const areasTransport = {
  getAreas() {
    return apiRequest<Area[]>("/areas");
  },

  getAdminAreas() {
    return apiRequest<AdminArea[]>("/admin/areas", undefined, true);
  },

  createArea(input: { slug: string; nameMy: string; nameEn?: string; sortOrder?: number }) {
    return apiRequest<AdminArea>(
      "/admin/areas",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
      true,
    );
  },

  updateArea(id: string, input: { nameMy: string; nameEn?: string; sortOrder?: number }) {
    return apiRequest<AdminArea>(
      `/admin/areas/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
      true,
    );
  },

  deleteArea(id: string) {
    return apiRequest<{ deleted: true }>(
      `/admin/areas/${id}`,
      {
        method: "DELETE",
      },
      true,
    );
  },
};
