import "server-only";

import { apiRequest } from "@/lib/api";

import type { Place, PlaceMutation, PlaceSummary, UploadTicket } from "./types/place";

export const placesTransport = {
  getPlaces(query: string) {
    return apiRequest<Place[]>(`/places${query}`);
  },

  getPlace(id: string) {
    return apiRequest<Place>(`/places/${id}`);
  },

  getAdminPlaces(query: string) {
    return apiRequest<Place[]>(`/admin/places${query}`, undefined, true);
  },

  getAdminSummary() {
    return apiRequest<PlaceSummary>("/admin/places/summary", undefined, true);
  },

  createPlace(input: PlaceMutation) {
    return apiRequest<Place>(
      "/admin/places",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
      true,
    );
  },

  updatePlace(id: string, input: Partial<PlaceMutation>) {
    return apiRequest<Place>(
      `/admin/places/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
      true,
    );
  },

  deletePlace(id: string) {
    return apiRequest<{ deleted: true }>(
      `/admin/places/${id}`,
      {
        method: "DELETE",
      },
      true,
    );
  },

  createUpload(contentType: string) {
    return apiRequest<UploadTicket>(
      "/admin/uploads",
      {
        method: "POST",
        body: JSON.stringify({ contentType }),
      },
      true,
    );
  },

  deleteUpload(url: string) {
    return apiRequest<{ deleted: true }>(
      "/admin/uploads",
      {
        method: "DELETE",
        body: JSON.stringify({ url }),
      },
      true,
    );
  },
};
