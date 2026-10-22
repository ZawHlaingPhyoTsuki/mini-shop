import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ENV } from "@/env.server";
import {
  createUpload,
  IMAGE_EXTENSIONS,
  MAX_FILE_SIZE,
  publicAssetUrl,
  statUpload,
} from "@/lib/storage";
import { auth, db } from "@/services";

const imageTypes = Object.keys(IMAGE_EXTENSIONS) as [
  keyof typeof IMAGE_EXTENSIONS,
  ...(keyof typeof IMAGE_EXTENSIONS)[],
];

const uploadRequestSchema = z.object({
  contentType: z.enum(imageTypes),
  size: z.number().int().positive().max(MAX_FILE_SIZE),
});

const completeUploadSchema = uploadRequestSchema.extend({
  key: z.string().min(1),
});

/**
 * Creates an avatar key scoped to the signed-in user.
 *
 * @param userId Authenticated user ID.
 * @param contentType Validated image MIME type.
 * @returns A server-generated object key.
 */
function avatarKey(userId: string, contentType: keyof typeof IMAGE_EXTENSIONS) {
  return `avatars/${userId}/${crypto.randomUUID()}.${IMAGE_EXTENSIONS[contentType]}`;
}

/**
 * Checks that a key belongs to the signed-in user's avatar namespace.
 *
 * @param userId Authenticated user ID.
 * @param key Object key returned by the upload ticket.
 * @returns True when the key has the expected user-scoped shape.
 */
function isOwnAvatarKey(userId: string, key: string) {
  return new RegExp(`^avatars/${userId}/[0-9a-f-]{36}\\.(png|jpg|webp|gif)$`).test(key);
}

export const Route = createFileRoute("/api/assets")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const latest = await db.asset.findFirst({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          select: { id: true, key: true },
        });

        return Response.json({
          asset: latest
            ? { id: latest.id, key: latest.key, url: publicAssetUrl(latest.key) }
            : null,
        });
      },

      POST: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const parsed = uploadRequestSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json(
            { error: "Only png, jpeg, webp and gif images up to 5 MB are allowed" },
            { status: 400 },
          );
        }

        const key = avatarKey(session.user.id, parsed.data.contentType);
        const uploadUrl = await createUpload(key, parsed.data.contentType, parsed.data.size);

        return Response.json({ key, uploadUrl });
      },

      PATCH: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const parsed = completeUploadSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success || !isOwnAvatarKey(session.user.id, parsed.data.key)) {
          return Response.json({ error: "Invalid upload" }, { status: 400 });
        }

        const { key, contentType, size } = parsed.data;
        const object = await statUpload(key).catch(() => null);

        if (!object || !object.contentType.startsWith(contentType) || object.size !== size) {
          return Response.json(
            { error: "Uploaded file does not match the request" },
            { status: 400 },
          );
        }

        const created = await db.asset.create({
          data: {
            userId: session.user.id,
            bucket: ENV.NEON_BUCKET_NAME,
            key,
            contentType,
            size,
          },
          select: { id: true, key: true },
        });

        return Response.json({
          asset: {
            id: created.id,
            key: created.key,
            url: publicAssetUrl(created.key),
          },
        });
      },
    },
  },
});
