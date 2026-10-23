import { z } from "zod";

import { slugSchema } from "@/domain/shared/validation";

export const shopInputSchema = z.object({
  name: z.string().trim().min(2, "Shop name must be at least 2 characters").max(120),
  slug: slugSchema,
  descriptionEn: z.string().trim().max(2_000).optional(),
  descriptionMy: z.string().trim().max(2_000).optional(),
  contactPhone: z.string().trim().max(30).optional(),
});

export type ShopInput = z.infer<typeof shopInputSchema>;

export const reviewShopInputSchema = z
  .object({
    shopId: z.uuid(),
    decision: z.enum(["approve", "reject"]),
    note: z.string().trim().max(500).optional(),
  })
  .refine((input) => input.decision !== "reject" || Boolean(input.note), {
    message: "A reason is required when rejecting a shop",
    path: ["note"],
  });

export type ReviewShopInput = z.infer<typeof reviewShopInputSchema>;
