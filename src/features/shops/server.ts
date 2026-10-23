import { createServerFn } from "@tanstack/react-start";
import type { Prisma } from "@/generated/prisma/client";
import { z } from "zod";

import { reviewShopInputSchema, shopInputSchema } from "@/features/shops/schema";
import { canTransition } from "@/features/shops/status";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/authz";
import { authMiddleware } from "@/middleware/auth";

const publicShopSelect = {
  id: true,
  name: true,
  slug: true,
  descriptionEn: true,
  descriptionMy: true,
  logoObjectKey: true,
  bannerObjectKey: true,
  contactPhone: true,
  socialLinks: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.ShopSelect;

const myShopSelect = {
  ...publicShopSelect,
  reviewNote: true,
  reviewedAt: true,
} as const satisfies Prisma.ShopSelect;

export const getShopBySlug = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const shop = await prisma.shop.findFirst({
      where: { slug: data.slug, status: "ACTIVE" },
      select: publicShopSelect,
    });

    if (!shop) {
      return { error: "Shop not found" };
    }

    return { shop };
  });

export const getMyShop = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = requireUser(context.session);
    return prisma.shop.findUnique({ where: { ownerUserId: user.id }, select: myShopSelect });
  });

export const createShop = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(shopInputSchema)
  .handler(async ({ context, data }) => {
    const user = requireUser(context.session);

    try {
      const shop = await prisma.shop.create({
        data: {
          ...data,
          ownerUserId: user.id,
          status: "PENDING_REVIEW",
        },
        select: myShopSelect,
      });

      return { shop };
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") {
        return { error: "You already have a shop, or that URL is already taken." };
      }
      throw error;
    }
  });

export const updateMyShop = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(shopInputSchema)
  .handler(async ({ context, data }) => {
    const user = requireUser(context.session);

    try {
      const shop = await prisma.shop.update({
        where: { ownerUserId: user.id },
        data,
        select: myShopSelect,
      });

      return { shop };
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") {
        return { error: "That URL is already taken." };
      }
      if ((error as { code?: string }).code === "P2025") {
        return { error: "Shop not found." };
      }
      throw error;
    }
  });

export const resubmitShop = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = requireUser(context.session);

    const shop = await prisma.shop.findUnique({
      where: { ownerUserId: user.id },
      select: { id: true, status: true },
    });

    if (!shop) {
      return { error: "Shop not found." };
    }

    if (!canTransition(shop.status, "PENDING_REVIEW")) {
      return { error: `Shop cannot be resubmitted from ${shop.status}.` };
    }

    const { count } = await prisma.shop.updateMany({
      where: { id: shop.id, status: "DRAFT" },
      data: {
        status: "PENDING_REVIEW",
        reviewNote: null,
        reviewedAt: null,
        reviewedByUserId: null,
      },
    });

    if (count === 0) {
      return { error: "Shop is not a draft." };
    }

    return { ok: true };
  });

export const listShopsForReview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    requireAdmin(context.session);

    return prisma.shop.findMany({
      where: { status: "PENDING_REVIEW" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        descriptionEn: true,
        contactPhone: true,
        createdAt: true,
        owner: { select: { id: true, name: true, email: true } },
      },
    });
  });

export const reviewShop = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(reviewShopInputSchema)
  .handler(async ({ context, data }) => {
    const admin = requireAdmin(context.session);
    const approved = data.decision === "approve";

    const { count } = await prisma.shop.updateMany({
      where: { id: data.shopId, status: "PENDING_REVIEW" },
      data: {
        status: approved ? "ACTIVE" : "DRAFT",
        reviewNote: approved ? null : (data.note ?? null),
        reviewedAt: new Date(),
        reviewedByUserId: admin.id,
      },
    });

    if (count === 0) {
      return { error: "Shop is not awaiting review." };
    }

    return { ok: true, status: approved ? "ACTIVE" : "DRAFT" };
  });
