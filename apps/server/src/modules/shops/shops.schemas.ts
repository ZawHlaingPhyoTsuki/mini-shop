import { z } from "zod";

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only");

const optionalText = z.string().trim().max(2_000).optional();

export const createShopSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug,
  descriptionEn: optionalText,
  descriptionMy: optionalText,
  contactPhone: z.string().trim().min(5).max(40).optional(),
  socialLinks: z.record(z.string(), z.string().trim().url()).optional(),
});

export const updateShopSchema = createShopSchema.omit({ slug: true }).partial();

export const reviewShopSchema = z.object({
  reviewNote: z.string().trim().min(1).max(1_000).optional(),
});

export type CreateShopDto = z.infer<typeof createShopSchema>;
export type UpdateShopDto = z.infer<typeof updateShopSchema>;
export type ReviewShopDto = z.infer<typeof reviewShopSchema>;
