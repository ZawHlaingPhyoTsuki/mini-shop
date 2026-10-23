import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service.js";
import type { CreateCategoryDto, UpdateCategoryDto } from "./categories.schemas.js";

@Injectable()
export class CategoriesAdminService {
  constructor(private readonly db: PrismaService) {}

  async list() {
    const categories = await this.db.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
      include: { _count: { select: { products: true } } },
    });
    return categories.map(toCategoryResponse);
  }

  async create(dto: CreateCategoryDto) {
    if (await this.db.category.findUnique({ where: { slug: dto.slug } })) {
      throw new ConflictException(`Category "${dto.slug}" already exists`);
    }
    const category = await this.db.category.create({
      data: dto,
      include: { _count: { select: { products: true } } },
    });
    return toCategoryResponse(category);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.getCategory(id);
    const category = await this.db.category.update({
      where: { id },
      data: dto,
      include: { _count: { select: { products: true } } },
    });
    return toCategoryResponse(category);
  }

  async remove(id: string) {
    const category = await this.getCategory(id);
    if (category._count.products > 0) {
      throw new BadRequestException(
        `Category "${category.slug}" still has ${category._count.products} products; move them first`,
      );
    }
    await this.db.category.delete({ where: { id } });
  }

  private async getCategory(id: string) {
    const category = await this.db.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }
}

function toCategoryResponse(category: {
  _count: { products: number };
  id: string;
  slug: string;
  nameEn: string;
  nameMy: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  const { _count, ...rest } = category;
  return { ...rest, productCount: _count.products };
}
