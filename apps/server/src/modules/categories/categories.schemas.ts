import { z } from "zod";

export const createCategorySchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+([_-][a-z0-9]+)*$/, "lowercase letters, numbers, _ or - only"),
  nameEn: z.string().trim().min(1).max(120),
  nameMy: z.string().trim().min(1).max(120).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = createCategorySchema.omit({ slug: true }).partial();

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
