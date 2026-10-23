import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { ProductStatus, ShopStatus } from "../../generated/enums.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { CreateShopDto, ReviewShopDto, UpdateShopDto } from "./shops.schemas.js";

@Injectable()
export class ShopsService {
  constructor(private readonly db: PrismaService) {}

  async getPublicBySlug(slug: string) {
    const shop = await this.db.shop.findFirst({
      where: { slug, status: ShopStatus.ACTIVE },
      select: {
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
        products: {
          where: { status: ProductStatus.PUBLISHED },
          include: {
            category: { select: { id: true, slug: true, nameEn: true, nameMy: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!shop) throw new NotFoundException("Shop not found");
    return shop;
  }

  async create(ownerUserId: string, dto: CreateShopDto) {
    const existing = await this.db.shop.findFirst({
      where: { OR: [{ ownerUserId }, { slug: dto.slug }] },
      select: { ownerUserId: true, slug: true },
    });
    if (existing?.ownerUserId === ownerUserId) {
      throw new ConflictException("You already have a shop registration");
    }
    if (existing?.slug === dto.slug)
      throw new ConflictException("That shop slug is already in use");

    return this.db.shop.create({
      data: { ...dto, ownerUserId, status: ShopStatus.PENDING_REVIEW },
      select: shopSelect,
    });
  }

  async getMine(ownerUserId: string) {
    const shop = await this.db.shop.findUnique({ where: { ownerUserId }, select: shopSelect });
    if (!shop) throw new NotFoundException("No shop registration found");
    return shop;
  }

  async updateMine(ownerUserId: string, dto: UpdateShopDto) {
    const shop = await this.getOwned(ownerUserId);
    if (shop.status === ShopStatus.PENDING_REVIEW) {
      throw new ForbiddenException("Your shop is under review and cannot be edited");
    }
    if (shop.status === ShopStatus.CLOSED || shop.status === ShopStatus.SUSPENDED) {
      throw new ForbiddenException("This shop cannot be edited");
    }
    return this.db.shop.update({ where: { id: shop.id }, data: dto, select: shopSelect });
  }

  async resubmit(ownerUserId: string) {
    const shop = await this.getOwned(ownerUserId);
    if (shop.status !== ShopStatus.DRAFT) {
      throw new ForbiddenException("Only a rejected draft shop can be resubmitted");
    }
    return this.db.shop.update({
      where: { id: shop.id },
      data: {
        status: ShopStatus.PENDING_REVIEW,
        reviewNote: null,
        reviewedAt: null,
        reviewedByUserId: null,
      },
      select: shopSelect,
    });
  }

  listForAdmin() {
    return this.db.shop.findMany({
      select: { ...shopSelect, owner: { select: { id: true, name: true, email: true } } },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    });
  }

  async approve(adminUserId: string, shopId: string, dto: ReviewShopDto) {
    const shop = await this.getById(shopId);
    if (shop.status !== ShopStatus.PENDING_REVIEW) {
      throw new ConflictException("Only a pending shop can be approved");
    }
    return this.db.shop.update({
      where: { id: shop.id },
      data: {
        status: ShopStatus.ACTIVE,
        reviewNote: dto.reviewNote ?? null,
        reviewedAt: new Date(),
        reviewedByUserId: adminUserId,
      },
      select: shopSelect,
    });
  }

  async reject(adminUserId: string, shopId: string, dto: ReviewShopDto) {
    if (!dto.reviewNote) throw new ConflictException("A rejection note is required");
    const shop = await this.getById(shopId);
    if (shop.status !== ShopStatus.PENDING_REVIEW) {
      throw new ConflictException("Only a pending shop can be rejected");
    }
    return this.db.shop.update({
      where: { id: shop.id },
      data: {
        status: ShopStatus.DRAFT,
        reviewNote: dto.reviewNote,
        reviewedAt: new Date(),
        reviewedByUserId: adminUserId,
      },
      select: shopSelect,
    });
  }

  private async getOwned(ownerUserId: string) {
    const shop = await this.db.shop.findUnique({
      where: { ownerUserId },
      select: { id: true, status: true },
    });
    if (!shop) throw new NotFoundException("No shop registration found");
    return shop;
  }

  private async getById(id: string) {
    const shop = await this.db.shop.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!shop) throw new NotFoundException("Shop not found");
    return shop;
  }
}

const shopSelect = {
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
  reviewNote: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;
