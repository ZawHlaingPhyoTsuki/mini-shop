import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { Roles } from "@thallesp/nestjs-better-auth";

import { AreasAdminService } from "./areas-admin.service.js";
import {
  createAreaSchema,
  updateAreaSchema,
  type CreateAreaDto,
  type UpdateAreaDto,
} from "./areas.schemas.js";

@Controller("admin/areas")
@Roles(["admin"])
export class AreasAdminController {
  constructor(private readonly areas: AreasAdminService) {}

  @Get()
  list() {
    return this.areas.list();
  }

  @Post()
  create(@Body({ schema: createAreaSchema }) dto: CreateAreaDto) {
    return this.areas.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body({ schema: updateAreaSchema }) dto: UpdateAreaDto) {
    return this.areas.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(200)
  async remove(@Param("id") id: string) {
    await this.areas.remove(id);
    return { deleted: true };
  }
}
