import { z } from "zod";

import { SLUG_MESSAGE, SLUG_PATTERN } from "@/lib/slug";

export const categoryInputSchema = z.object({
  slug: z.string().trim().regex(SLUG_PATTERN, SLUG_MESSAGE),
  nameMy: z.string().trim().min(1),
  nameEn: z.string().trim().optional(),
});

// Slug is the public filter URL (?category=cafe), so it never changes.
export const categoryUpdateSchema = categoryInputSchema.omit({ slug: true });

export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type CategoryUpdate = z.infer<typeof categoryUpdateSchema>;

export const categoryFormSchema = z.object({
  slug: z.string().trim().regex(SLUG_PATTERN, SLUG_MESSAGE),
  nameMy: z.string().trim().min(1, "Enter a name in Myanmar"),
  nameEn: z.string(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
