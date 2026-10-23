import type { Category } from "../../categories/types/category";
import type { Area } from "../../areas/types/area";
import type { PlaceTag, PriceLevel } from "../places-constants";

export type PlaceSummary = {
  allPlaces: number;
  publishedPlaces: number;
  hiddenPlaces: number;
  areasCovered: number;
};

export type PlaceMutation = {
  slug?: string;
  nameMy: string;
  nameEn?: string;
  descriptionMy?: string;
  categoryId: string;
  areaId?: string;
  addressText?: string;
  phone?: string;
  phoneSecondary?: string;
  facebookUrl?: string;
  telegramHandle?: string;
  hoursText?: string;
  priceNote?: string;
  priceLevel?: PriceLevel;
  tags?: PlaceTag[];
  latitude?: number | null;
  longitude?: number | null;
  photos?: string[];
  isActive?: boolean;
};

export type UploadTicket = {
  uploadUrl: string;
  url: string;
};

export type Place = {
  id: string;
  slug: string;
  nameMy: string;
  nameEn: string | null;
  descriptionMy: string | null;
  categoryId: string;
  category: Category & { createdAt: string; updatedAt: string };
  areaId: string | null;
  area: (Area & { createdAt: string; updatedAt: string }) | null;
  addressText: string | null;
  phone: string | null;
  phoneSecondary: string | null;
  facebookUrl: string | null;
  telegramHandle: string | null;
  hoursText: string | null;
  priceNote: string | null;
  priceLevel: PriceLevel | null;
  tags: PlaceTag[];
  latitude: number | null;
  longitude: number | null;
  photos: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
