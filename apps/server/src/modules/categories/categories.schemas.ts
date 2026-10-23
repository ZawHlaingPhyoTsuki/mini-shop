import { z } from "zod";

export const createCategorySchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+([_-][a-z0-9]+)*$/, "lowercase letters, numbers, _ or - only"),
  nameMy: z.string().trim().min(1),
  nameEn: z.string().trim().optional(),
});

// Slug is the public filter URL (?category=cafe), so it never changes.
export const updateCategorySchema = createCategorySchema.omit({ slug: true });

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
