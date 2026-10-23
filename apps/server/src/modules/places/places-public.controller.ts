import { Controller, Get, Param, Query } from "@nestjs/common";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

import { listPlacesSchema, type ListPlacesQuery } from "./places.schemas.js";
import { PlacesPublicService } from "./places-public.service.js";

@Controller()
export class PlacesPublicController {
  constructor(private readonly placesService: PlacesPublicService) {}

  @Get("places")
  @AllowAnonymous()
  list(@Query({ schema: listPlacesSchema }) query: ListPlacesQuery) {
    return this.placesService.listPlaces(query);
  }

  @Get("places/:id")
  @AllowAnonymous()
  get(@Param("id") id: string) {
    return this.placesService.getPlace(id);
  }

  @Get("categories")
  @AllowAnonymous()
  listCategories() {
    return this.placesService.listCategories();
  }

  @Get("areas")
  @AllowAnonymous()
  listAreas() {
    return this.placesService.listAreas();
  }
}
