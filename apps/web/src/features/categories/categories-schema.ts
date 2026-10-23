import { z } from "zod";

import { SLUG_MESSAGE, SLUG_PATTERN } from "@/lib/slug";

export const categoryInputSchema = z.object({
  slug: z.string().trim().regex(SLUG_PATTERN, SLUG_MESSAGE),
  nameEn: z.string().trim().min(1, "English name is required").max(120),
  nameMy: z.string().trim().max(120).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const categoryUpdateSchema = categoryInputSchema.omit({ slug: true });

export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type CategoryUpdate = z.infer<typeof categoryUpdateSchema>;

export const categoryFormSchema = z.object({
  slug: z.string().trim().regex(SLUG_PATTERN, SLUG_MESSAGE),
  nameEn: z.string().trim().min(1, "Enter a category name in English"),
  nameMy: z.string(),
  sortOrder: z.string(),
  isActive: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
