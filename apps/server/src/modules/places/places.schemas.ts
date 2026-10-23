import { z } from "zod";

export const PLACE_TAGS = [
  "halal",
  "vegetarian",
  "delivery",
  "dine-in",
  "takeaway",
  "parking",
  "wifi",
  "air-conditioned",
  "kid-friendly",
  "accepts-thb",
  "accepts-mmk",
] as const;

export type PlaceTag = (typeof PLACE_TAGS)[number];

export const placeSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "lowercase letters, numbers and hyphens only");

const telegramHandle = z
  .string()
  .trim()
  .optional()
  .transform((value) => value?.replace(/^@+/, "").trim() || undefined);

// One check, one error: new URL() already rejects scheme-less and malformed
// input, so chaining .url() with a separate https refine would report the
// same bad value twice.
function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export const listPlacesSchema = z.object({
  category: z.string().min(1).optional(),
  area: z.string().min(1).optional(),
  search: z.string().min(1).optional(),
});

export type ListPlacesQuery = z.infer<typeof listPlacesSchema>;

const placeFields = {
  slug: placeSlugSchema.optional(),
  nameMy: z.string().min(1),
  nameEn: z.string().optional(),
  descriptionMy: z.string().optional(),
  categoryId: z.string().min(1),
  areaId: z.string().min(1).optional(),
  addressText: z.string().optional(),
  phone: z.string().optional(),
  phoneSecondary: z.string().trim().optional(),
  facebookUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => value === undefined || isHttpsUrl(value),
      "Enter a valid Facebook URL starting with https://",
    ),
  telegramHandle,
  hoursText: z.string().optional(),
  priceNote: z.string().trim().optional(),
  priceLevel: z.enum(["LOW", "MID", "HIGH"]).optional(),
  tags: z.array(z.enum(PLACE_TAGS)).optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  photos: z.array(z.string().url()).optional(),
  isActive: z.boolean().optional(),
};

// Coordinates only make sense as a pair: a place with one but not the other
// would render a map pin in the wrong place (or nowhere at all).
function coordinatesPaired(
  value: { latitude?: number | null; longitude?: number | null },
  ctx: z.RefinementCtx,
) {
  const hasLat = value.latitude !== undefined && value.latitude !== null;
  const hasLng = value.longitude !== undefined && value.longitude !== null;
  if (hasLat !== hasLng) {
    ctx.addIssue({
      code: "custom",
      message: "Set both latitude and longitude, or neither",
      path: hasLat ? ["longitude"] : ["latitude"],
    });
  }
}

export const createPlaceSchema = z.object(placeFields).superRefine(coordinatesPaired);

// Note: .partial() must run on the unrefined object first; zod v4 rejects
// .partial() on schemas that already carry refinements.
export const updatePlaceSchema = z.object(placeFields).partial().superRefine(coordinatesPaired);

export type CreatePlaceDto = z.infer<typeof createPlaceSchema>;
export type UpdatePlaceDto = z.infer<typeof updatePlaceSchema>;
