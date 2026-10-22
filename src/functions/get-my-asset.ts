import { createServerFn } from "@tanstack/react-start";

import { publicAssetUrl } from "@/lib/storage";
import { authMiddleware } from "@/middleware/auth";
import { db } from "@/services";

export type MyAsset = {
  id: string;
  key: string;
  url: string;
};

/**
 * The signed-in user's most recent asset.
 *
 * Only the object key is stored in Postgres; the public URL is derived from
 * the bucket endpoint.
 */
export const getMyAsset = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session?.user.id;
    if (!userId) {
      return null;
    }

    const latest = await db.asset.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, key: true },
    });

    if (!latest) {
      return null;
    }

    return { id: latest.id, key: latest.key, url: publicAssetUrl(latest.key) };
  });
