import { Injectable, NotFoundException } from "@nestjs/common";

import type { ListPlacesQuery } from "./places.schemas.js";
import { PlacesRepository } from "./places.repository.js";

@Injectable()
export class PlacesPublicService {
  constructor(private readonly placesRepository: PlacesRepository) {}

  listCategories() {
    return this.placesRepository.listCategories();
  }

  listAreas() {
    return this.placesRepository.listAreas();
  }

  listPlaces(query: ListPlacesQuery) {
    return this.placesRepository.listPublic(query);
  }

  async getPlace(id: string) {
    const place = await this.placesRepository.findPublic(id);
    if (!place) throw new NotFoundException(`Place ${id} not found`);
    return place;
  }
}
