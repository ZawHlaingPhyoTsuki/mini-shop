import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { formatMoney } from "@/domain/shared/money";
import { prisma } from "@/lib/prisma";

export const getProductBySlug = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const product = await prisma.product.findFirst({
      where: { slug: data.slug, status: "PUBLISHED" },
      select: {
        id: true,
        nameEn: true,
        nameMy: true,
        slug: true,
        descriptionEn: true,
        descriptionMy: true,
        priceMMK: true,
        priceTHB: true,
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
            nameEn: true,
            nameMy: true,
            isActive: true,
            sortOrder: true,
          },
        },
      },
    });

    if (!product) {
      return { error: "Product not found" };
    }

    return {
      product: {
        ...product,
        price: formatMoney({ amount: product.priceMMK, currency: "MMK" }),
      },
    };
  });
