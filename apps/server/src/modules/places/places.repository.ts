import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service.js";
import type { CreatePlaceDto, ListPlacesQuery, UpdatePlaceDto } from "./places.schemas.js";

function searchConditions(search: string) {
  return [
    { nameMy: { contains: search, mode: "insensitive" as const } },
    { nameEn: { contains: search, mode: "insensitive" as const } },
    { area: { nameMy: { contains: search, mode: "insensitive" as const } } },
    { area: { nameEn: { contains: search, mode: "insensitive" as const } } },
    { category: { nameMy: { contains: search, mode: "insensitive" as const } } },
    { category: { nameEn: { contains: search, mode: "insensitive" as const } } },
    { category: { slug: { contains: search, mode: "insensitive" as const } } },
  ];
}

const withRelations = { category: true, area: true } as const;

@Injectable()
export class PlacesRepository {
  constructor(private readonly db: PrismaService) {}

  async listCategories() {
    return this.db.category.findMany({
      orderBy: { nameEn: "asc" },
      select: { id: true, slug: true, nameMy: true, nameEn: true },
    });
  }

  async listAreas() {
    return this.db.area.findMany({
      orderBy: [{ sortOrder: "asc" }, { nameMy: "asc" }],
      select: { id: true, slug: true, nameMy: true, nameEn: true, sortOrder: true },
    });
  }

  async listPublic(query: ListPlacesQuery) {
    return this.db.place.findMany({
      where: {
        isActive: true,
        category: query.category ? { slug: query.category } : undefined,
        area: query.area ? { slug: query.area } : undefined,
        ...(query.search ? { OR: searchConditions(query.search) } : {}),
      },
      include: withRelations,
      orderBy: { updatedAt: "desc" },
    });
  }

  async findPublic(id: string) {
    return this.db.place.findUnique({
      where: { id, isActive: true },
      include: withRelations,
    });
  }

  async listAdmin(query: ListPlacesQuery) {
    return this.db.place.findMany({
      where: {
        category: query.category ? { slug: query.category } : undefined,
        area: query.area ? { slug: query.area } : undefined,
        ...(query.search ? { OR: searchConditions(query.search) } : {}),
      },
      include: withRelations,
      orderBy: { updatedAt: "desc" },
    });
  }

  async getSummary() {
    const [allPlaces, publishedPlaces, areasCovered] = await Promise.all([
      this.db.place.count(),
      this.db.place.count({ where: { isActive: true } }),
      this.db.area.count({ where: { places: { some: { isActive: true } } } }),
    ]);

    return { allPlaces, publishedPlaces, areasCovered };
  }

  findById(id: string) {
    return this.db.place.findUnique({ where: { id }, include: withRelations });
  }

  categoryExists(categoryId: string) {
    return this.db.category.findUnique({ where: { id: categoryId } });
  }

  areaExists(areaId: string) {
    return this.db.area.findUnique({ where: { id: areaId } });
  }

  slugTaken(slug: string, exceptId?: string) {
    return this.db.place.findFirst({
      where: { slug, id: exceptId ? { not: exceptId } : undefined },
    });
  }

  async listSlugs(): Promise<string[]> {
    return (await this.db.place.findMany({ select: { slug: true } })).map((p) => p.slug);
  }

  create(dto: CreatePlaceDto & { slug: string }) {
    return this.db.place.create({ data: dto, include: withRelations });
  }

  update(id: string, dto: UpdatePlaceDto) {
    return this.db.place.update({ where: { id }, data: dto, include: withRelations });
  }

  delete(id: string) {
    return this.db.place.delete({ where: { id } });
  }
}
