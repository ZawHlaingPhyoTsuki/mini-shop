import { z } from "zod";

export const uploadRequestSchema = z.object({
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]),
});

export type UploadRequestDto = z.infer<typeof uploadRequestSchema>;

export const deleteUploadSchema = z.object({
  url: z.string().url(),
});

export type DeleteUploadDto = z.infer<typeof deleteUploadSchema>;
