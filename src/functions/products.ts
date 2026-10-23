import { createServerFn } from "@tanstack/react-start";

import { db } from "@/services";
import { localizedName } from "@/domain/shared/locale";
import { formatMoney } from "@/domain/shared/money";

export const getProductBySlug = createServerFn({ method: "GET" }).handler(
  async (context: unknown, slug: string) => {
    const product = await db.product.findFirst({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        priceAmount: true,
        currency: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            slug: true,
            names: true,
            isActive: true,
            sortOrder: true,
          },
        },
      },
    });

    if (!product) {
      return { error: "Product not found" };
    }

    const displayName = localizedName(product.names, "en");

    return {
      product: {
        id: product.id,
        name: displayName,
        slug: product.slug,
        description: product.description,
        price: formatMoney({ amount: product.priceAmount, currency: product.currency }, "en"),
        currency: product.currency,
        status: product.status,
        publishedAt: product.publishedAt,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        shop: product.shop,
        category: product.category,
      },
    };
  },
);
