import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from "@nestjs/common";
import { Roles } from "@thallesp/nestjs-better-auth";

import { PlacesAdminService } from "./places-admin.service.js";
import {
  createPlaceSchema,
  listPlacesSchema,
  updatePlaceSchema,
  type CreatePlaceDto,
  type ListPlacesQuery,
  type UpdatePlaceDto,
} from "./places.schemas.js";

@Controller("admin/places")
@Roles(["admin"])
export class PlacesAdminController {
  constructor(private readonly placesService: PlacesAdminService) {}

  @Get()
  list(@Query({ schema: listPlacesSchema }) query: ListPlacesQuery) {
    return this.placesService.listPlaces(query);
  }

  @Get("summary")
  summary() {
    return this.placesService.getSummary();
  }

  @Post()
  create(@Body({ schema: createPlaceSchema }) dto: CreatePlaceDto) {
    return this.placesService.createPlace(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body({ schema: updatePlaceSchema }) dto: UpdatePlaceDto) {
    return this.placesService.updatePlace(id, dto);
  }

  @Delete(":id")
  @HttpCode(200)
  async remove(@Param("id") id: string) {
    await this.placesService.removePlace(id);
    return { deleted: true };
  }
}
