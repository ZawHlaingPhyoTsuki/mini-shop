import { z } from "zod";

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only");

const optionalText = z.string().trim().max(5_000).optional();

export const createProductSchema = z.object({
  nameEn: z.string().trim().min(1).max(200),
  nameMy: z.string().trim().min(1).max(200).optional(),
  descriptionEn: optionalText,
  descriptionMy: optionalText,
  slug,
  categoryId: z.uuid().optional(),
  priceMMK: z.number().int().positive(),
  priceTHB: z.number().int().positive().optional(),
  stockQuantity: z.number().int().nonnegative().nullable().optional(),
  sku: z.string().trim().min(1).max(100).optional(),
});

export const updateProductSchema = createProductSchema
  .omit({ slug: true })
  .partial()
  .extend({
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  });

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
