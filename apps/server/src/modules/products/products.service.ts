import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { ProductStatus, ShopStatus } from "../../generated/enums.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { CreateProductDto, UpdateProductDto } from "./products.schemas.js";

@Injectable()
export class ProductsService {
  constructor(private readonly db: PrismaService) {}

  async listPublic(query?: { search?: string; categorySlug?: string; categoryId?: string }) {
    const where: Record<string, unknown> = {
      status: ProductStatus.PUBLISHED,
      shop: { status: ShopStatus.ACTIVE },
    };
    if (query?.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query?.categorySlug) {
      where.category = { slug: query.categorySlug };
    }
    if (query?.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { nameEn: { contains: term, mode: "insensitive" } },
        { nameMy: { contains: term, mode: "insensitive" } },
        { descriptionEn: { contains: term, mode: "insensitive" } },
        { descriptionMy: { contains: term, mode: "insensitive" } },
      ];
    }
    return this.db.product.findMany({
      where,
      include: {
        shop: { select: { id: true, name: true, slug: true, logoObjectKey: true } },
        category: { select: { id: true, slug: true, nameEn: true, nameMy: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getPublicBySlug(slug: string, shopSlug?: string) {
    const where: Record<string, unknown> = {
      slug,
      status: ProductStatus.PUBLISHED,
      shop: { status: ShopStatus.ACTIVE },
    };
    if (shopSlug) {
      where.shop = { slug: shopSlug, status: ShopStatus.ACTIVE };
    }
    const product = await this.db.product.findFirst({
      where,
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoObjectKey: true,
            contactPhone: true,
          },
        },
        category: { select: { id: true, slug: true, nameEn: true, nameMy: true } },
      },
    });
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  async listMine(ownerUserId: string) {
    const shop = await this.getShop(ownerUserId);
    return this.db.product.findMany({
      where: { shopId: shop.id },
      include: { category: { select: { id: true, slug: true, nameEn: true, nameMy: true } } },
      orderBy: { updatedAt: "desc" },
    });
  }

  async create(ownerUserId: string, dto: CreateProductDto) {
    const shop = await this.getShop(ownerUserId);
    await this.assertCategory(dto.categoryId);
    if (
      await this.db.product.findUnique({
        where: { shopId_slug: { shopId: shop.id, slug: dto.slug } },
      })
    ) {
      throw new ConflictException("That product slug is already in use in your shop");
    }
    return this.db.product.create({ data: { ...dto, shopId: shop.id } });
  }

  async update(ownerUserId: string, productId: string, dto: UpdateProductDto) {
    const shop = await this.getShop(ownerUserId);
    const product = await this.db.product.findFirst({ where: { id: productId, shopId: shop.id } });
    if (!product) throw new NotFoundException("Product not found");
    await this.assertCategory(dto.categoryId);
    if (dto.status === ProductStatus.PUBLISHED && shop.status !== ShopStatus.ACTIVE) {
      throw new ForbiddenException("Only products from an active shop can be published");
    }
    return this.db.product.update({
      where: { id: product.id },
      data: {
        ...dto,
        publishedAt:
          dto.status === ProductStatus.PUBLISHED && product.status !== ProductStatus.PUBLISHED
            ? new Date()
            : dto.status === ProductStatus.DRAFT || dto.status === ProductStatus.ARCHIVED
              ? null
              : undefined,
      },
    });
  }

  private async getShop(ownerUserId: string) {
    const shop = await this.db.shop.findUnique({
      where: { ownerUserId },
      select: { id: true, status: true },
    });
    if (!shop) throw new ForbiddenException("Register a shop before managing products");
    if (shop.status === ShopStatus.CLOSED || shop.status === ShopStatus.SUSPENDED) {
      throw new ForbiddenException("This shop cannot manage products");
    }
    return shop;
  }

  private async assertCategory(categoryId: string | undefined) {
    if (!categoryId) return;
    const category = await this.db.category.findFirst({
      where: { id: categoryId, isActive: true },
    });
    if (!category) throw new NotFoundException("Active category not found");
  }
}
