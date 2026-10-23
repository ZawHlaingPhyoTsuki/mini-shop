import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/middleware/auth";
import { publicAssetUrl } from "@/lib/storage";
import { prisma } from "@/lib/prisma";

export const getUserAsset = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session?.user.id;
    if (!userId) {
      return null;
    }

    const latest = await prisma.asset.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, key: true },
    });

    if (!latest) {
      return null;
    }

    return { id: latest.id, key: latest.key, url: publicAssetUrl(latest.key) };
  });
