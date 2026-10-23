import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service.js";

@Injectable()
export class CategoriesPublicService {
  constructor(private readonly db: PrismaService) {}

  list() {
    return this.db.category.findMany({
      where: { isActive: true },
      select: { id: true, slug: true, nameEn: true, nameMy: true, sortOrder: true },
      orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
    });
  }
}
