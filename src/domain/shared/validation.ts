import { z } from "zod";

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens");

export const quantitySchema = z.number().int().positive().max(2_147_483_647);
