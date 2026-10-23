import { z } from "zod";

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Slug must be at least 3 characters")
  .max(120, "Slug cannot exceed 120 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only");

export const createProductSchema = z.object({
  nameEn: z.string().trim().min(1, "Product name in English is required").max(200),
  nameMy: z.string().trim().max(200).optional(),
  descriptionEn: z.string().trim().max(5000).optional(),
  descriptionMy: z.string().trim().max(5000).optional(),
  slug,
  categoryId: z.string().uuid("Invalid category").optional(),
  priceMMK: z
    .number()
    .int("Price must be a whole integer")
    .positive("Price must be greater than 0"),
  priceTHB: z
    .number()
    .int("Price must be a whole integer")
    .positive("Price must be greater than 0")
    .optional(),
  stockQuantity: z.number().int().nonnegative().nullable().optional(),
  sku: z.string().trim().max(100).optional(),
});

export const updateProductSchema = createProductSchema
  .omit({ slug: true })
  .partial()
  .extend({
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  });

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const productFormSchema = z.object({
  nameEn: z.string().trim().min(1, "Product name in English is required"),
  nameMy: z.string(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  categoryId: z.string(),
  priceMMK: z.string().min(1, "Price in MMK is required"),
  priceTHB: z.string(),
  stockQuantity: z.string(),
  sku: z.string(),
  descriptionEn: z.string(),
  descriptionMy: z.string(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
