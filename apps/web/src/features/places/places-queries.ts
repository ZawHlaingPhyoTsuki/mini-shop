import "server-only";

import { notFound } from "next/navigation";

import { ApiTransportError } from "@/lib/api";

import { placesTransport } from "./places-transport";
import type { Place, PlaceSummary } from "./types/place";

export async function getPlaces(filters?: {
  category?: string;
  area?: string;
  search?: string;
}): Promise<Place[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.area) params.set("area", filters.area);
  if (filters?.search) params.set("search", filters.search);
  const query = params.size > 0 ? `?${params.toString()}` : "";
  return placesTransport.getPlaces(query);
}

export async function getPlace(id: string): Promise<Place> {
  try {
    return await placesTransport.getPlace(id);
  } catch (error) {
    if (error instanceof ApiTransportError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}

export async function getAdminPlaces(filters?: {
  category?: string;
  area?: string;
}): Promise<Place[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.area) params.set("area", filters.area);
  const query = params.size > 0 ? `?${params.toString()}` : "";
  return placesTransport.getAdminPlaces(query);
}

export async function getAdminPlaceSummary(): Promise<PlaceSummary> {
  return placesTransport.getAdminSummary();
}
