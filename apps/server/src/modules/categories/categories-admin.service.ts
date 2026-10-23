import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service.js";
import { toAdminItem, withPlaceCount } from "../taxonomy.js";
import type { CreateCategoryDto, UpdateCategoryDto } from "./categories.schemas.js";

@Injectable()
export class CategoriesAdminService {
  constructor(private readonly db: PrismaService) {}

  async list() {
    const categories = await this.db.category.findMany({
      orderBy: [{ nameEn: "asc" }, { nameMy: "asc" }],
      include: withPlaceCount,
    });
    return categories.map(toAdminItem);
  }

  async create(dto: CreateCategoryDto) {
    if (await this.db.category.findUnique({ where: { slug: dto.slug } })) {
      throw new ConflictException(`Category "${dto.slug}" already exists`);
    }
    const category = await this.db.category.create({ data: dto, include: withPlaceCount });
    return toAdminItem(category);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.getCategory(id);
    const category = await this.db.category.update({
      where: { id },
      data: dto,
      include: withPlaceCount,
    });
    return toAdminItem(category);
  }

  async remove(id: string) {
    const category = await this.getCategory(id);
    if (category._count.places > 0) {
      throw new BadRequestException(
        `Category "${category.slug}" still has ${category._count.places} places; move them to another category first`,
      );
    }
    await this.db.category.delete({ where: { id } });
  }

  private async getCategory(id: string) {
    const category = await this.db.category.findUnique({
      where: { id },
      include: withPlaceCount,
    });
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }
}
