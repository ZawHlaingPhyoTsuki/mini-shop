import { z } from "zod";

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Slug must be at least 3 characters")
  .max(80, "Slug cannot exceed 80 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only");

export const createShopSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  slug,
  descriptionEn: z.string().trim().max(2000).optional(),
  descriptionMy: z.string().trim().max(2000).optional(),
  contactPhone: z.string().trim().min(5).max(40).optional(),
  facebookUrl: z.string().trim().url("Enter a valid URL").or(z.literal("")).optional(),
  tiktokUrl: z.string().trim().url("Enter a valid URL").or(z.literal("")).optional(),
});

export const updateShopSchema = createShopSchema.omit({ slug: true });

export type CreateShopInput = z.infer<typeof createShopSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;

export const shopFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  descriptionEn: z.string(),
  descriptionMy: z.string(),
  contactPhone: z.string(),
  facebookUrl: z.string(),
  tiktokUrl: z.string(),
});

export type ShopFormValues = z.infer<typeof shopFormSchema>;

export const reviewShopSchema = z.object({
  reviewNote: z.string().trim().max(1000).optional(),
});
