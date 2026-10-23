import { z } from "zod";

const SLUG_PATTERN = /^[a-z0-9]+([_-][a-z0-9]+)*$/;
const SLUG_MESSAGE = "Lowercase letters, numbers, _ or - only";

export const createAreaSchema = z.object({
  slug: z.string().trim().regex(SLUG_PATTERN, SLUG_MESSAGE),
  nameMy: z.string().trim().min(1),
  nameEn: z.string().trim().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// Slug is the public filter URL (?area=san-sai), so it never changes.
export const updateAreaSchema = createAreaSchema.omit({ slug: true });

export type CreateAreaDto = z.infer<typeof createAreaSchema>;
export type UpdateAreaDto = z.infer<typeof updateAreaSchema>;
