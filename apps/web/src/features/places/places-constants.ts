// Feature-wide UI strings for places. English labels for now; translated later.
// Keep every places UI string here, never scattered inline.

export const PRICE_LEVEL_LABELS = {
  LOW: { symbol: "$", name: "Budget" },
  MID: { symbol: "$$", name: "Moderate" },
  HIGH: { symbol: "$$$", name: "Premium" },
} as const;

export type PriceLevel = keyof typeof PRICE_LEVEL_LABELS;

export const PLACE_TAG_LABELS = {
  halal: "Halal",
  vegetarian: "Vegetarian",
  delivery: "Delivery",
  "dine-in": "Dine-in",
  takeaway: "Takeaway",
  parking: "Parking",
  wifi: "Wi-Fi",
  "air-conditioned": "Air-conditioned",
  "kid-friendly": "Kid-friendly",
  "accepts-thb": "Accepts THB",
  "accepts-mmk": "Accepts MMK",
} as const;

export type PlaceTag = keyof typeof PLACE_TAG_LABELS;

export const PLACE_TAGS = Object.keys(PLACE_TAG_LABELS) as PlaceTag[];

export function formatPhotoShrinkHint(photoCount: number, savedKb: number): string {
  const photos = photoCount === 1 ? "photo" : "photos";
  return `Resized ${photoCount} ${photos} for upload, saving about ${savedKb} KB.`;
}
