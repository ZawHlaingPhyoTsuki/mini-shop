import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service.js";
import { toAdminItem, withPlaceCount } from "../taxonomy.js";
import type { CreateAreaDto, UpdateAreaDto } from "./areas.schemas.js";

@Injectable()
export class AreasAdminService {
  constructor(private readonly db: PrismaService) {}

  async list() {
    const areas = await this.db.area.findMany({
      orderBy: [{ sortOrder: "asc" }, { nameMy: "asc" }],
      include: withPlaceCount,
    });
    return areas.map(toAdminItem);
  }

  async create(dto: CreateAreaDto) {
    if (await this.db.area.findUnique({ where: { slug: dto.slug } })) {
      throw new ConflictException(`Area "${dto.slug}" already exists`);
    }
    // New areas append after the latest order instead of piling onto 0.
    const sortOrder = dto.sortOrder ?? (await this.maxSortOrder()) + 1;
    const area = await this.db.area.create({
      data: { ...dto, sortOrder },
      include: withPlaceCount,
    });
    return toAdminItem(area);
  }

  async update(id: string, dto: UpdateAreaDto) {
    await this.getArea(id);
    const area = await this.db.area.update({
      where: { id },
      data: dto,
      include: withPlaceCount,
    });
    return toAdminItem(area);
  }

  async remove(id: string) {
    const area = await this.getArea(id);
    if (area._count.places > 0) {
      throw new BadRequestException(
        `Area "${area.slug}" still has ${area._count.places} places; move them to another area first`,
      );
    }
    await this.db.area.delete({ where: { id } });
  }

  private async getArea(id: string) {
    const area = await this.db.area.findUnique({ where: { id }, include: withPlaceCount });
    if (!area) throw new NotFoundException(`Area ${id} not found`);
    return area;
  }

  private async maxSortOrder(): Promise<number> {
    const result = await this.db.area.aggregate({ _max: { sortOrder: true } });
    return result._max.sortOrder ?? 0;
  }
}
