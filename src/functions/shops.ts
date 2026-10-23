import { createServerFn } from "@tanstack/react-start";

import { db } from "@/services";

export const getShopBySlug = createServerFn({ method: "GET" }).handler(
  async (context: unknown, slug: string) => {
    const shop = await db.shop.findFirst({
      where: { slug, status: "active" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoObjectKey: true,
        bannerObjectKey: true,
        contactPhone: true,
        socialLinks: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!shop || shop.status !== "active") {
      return { error: "Shop not found" };
    }

    return { shop };
  },
);
