import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { Roles } from "@thallesp/nestjs-better-auth";

import { CategoriesAdminService } from "./categories-admin.service.js";
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryDto,
  type UpdateCategoryDto,
} from "./categories.schemas.js";

@Controller("admin/categories")
@Roles(["admin"])
export class CategoriesAdminController {
  constructor(private readonly categories: CategoriesAdminService) {}

  @Get()
  list() {
    return this.categories.list();
  }

  @Post()
  create(@Body({ schema: createCategorySchema }) dto: CreateCategoryDto) {
    return this.categories.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body({ schema: updateCategorySchema }) dto: UpdateCategoryDto) {
    return this.categories.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(200)
  async remove(@Param("id") id: string) {
    await this.categories.remove(id);
    return { deleted: true };
  }
}
