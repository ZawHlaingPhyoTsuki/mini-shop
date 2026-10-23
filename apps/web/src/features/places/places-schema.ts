import { z } from "zod";

import { PLACE_TAGS } from "./places-constants";

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

const placeInputFields = {
  slug: placeSlugSchema.optional(),
  nameMy: z.string().trim().min(1),
  nameEn: z.string().trim().optional(),
  descriptionMy: z.string().trim().optional(),
  categoryId: z.string().min(1),
  areaId: z.string().min(1).optional(),
  addressText: z.string().trim().optional(),
  phone: z.string().trim().optional(),
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
  hoursText: z.string().trim().optional(),
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
function checkCoordinatesPaired(
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

export const placeInputSchema = z.object(placeInputFields).superRefine(checkCoordinatesPaired);

// Note: .partial() must run on the unrefined object first; zod v4 rejects
// .partial() on schemas that already carry refinements.
export const placeUpdateSchema = z
  .object(placeInputFields)
  .partial()
  .superRefine(checkCoordinatesPaired);

export type PlaceInput = z.infer<typeof placeInputSchema>;

export const placeFormSchema = z.object({
  nameMy: z.string().trim().min(1, "Enter a name in Myanmar"),
  nameEn: z.string(),
  slug: z
    .string()
    .refine(
      (value) => value.trim() === "" || placeSlugSchema.safeParse(value).success,
      "Lowercase letters, numbers and hyphens only",
    ),
  descriptionMy: z.string(),
  categoryId: z.string().min(1, "Select a category"),
  areaId: z.string(),
  addressText: z.string(),
  phone: z.string(),
  phoneSecondary: z.string(),
  facebookUrl: z.string(),
  telegramHandle: z.string(),
  hoursText: z.string(),
  priceLevel: z.string(),
  priceNote: z.string(),
  tags: z.array(z.enum(PLACE_TAGS)),
  isActive: z.boolean(),
});

export type PlaceFormValues = z.infer<typeof placeFormSchema>;
