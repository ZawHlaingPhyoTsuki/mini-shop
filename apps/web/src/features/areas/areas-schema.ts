import { z } from "zod";

import { SLUG_MESSAGE, SLUG_PATTERN } from "@/lib/slug";

export const areaInputSchema = z.object({
  slug: z.string().trim().regex(SLUG_PATTERN, SLUG_MESSAGE),
  nameMy: z.string().trim().min(1),
  nameEn: z.string().trim().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// Slug is the public filter URL (?area=san-sai), so it never changes.
export const areaUpdateSchema = areaInputSchema.omit({ slug: true });

export type AreaInput = z.infer<typeof areaInputSchema>;
export type AreaUpdate = z.infer<typeof areaUpdateSchema>;

export const areaFormSchema = z.object({
  slug: z.string().trim().regex(SLUG_PATTERN, SLUG_MESSAGE),
  nameMy: z.string().trim().min(1, "Enter a name in Myanmar"),
  nameEn: z.string(),
});

export type AreaFormValues = z.infer<typeof areaFormSchema>;
