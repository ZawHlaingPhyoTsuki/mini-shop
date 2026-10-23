import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import type { CreatePlaceDto, ListPlacesQuery, UpdatePlaceDto } from "./places.schemas.js";
import { buildPlaceSlug } from "./place-slug.js";
import { PlacesRepository } from "./places.repository.js";
import { UploadsService } from "../uploads/uploads.service.js";

@Injectable()
export class PlacesAdminService {
  constructor(
    private readonly placesRepository: PlacesRepository,
    private readonly uploads: UploadsService,
  ) {}

  async getSummary() {
    const summary = await this.placesRepository.getSummary();
    return {
      ...summary,
      hiddenPlaces: summary.allPlaces - summary.publishedPlaces,
    };
  }

  listPlaces(query: ListPlacesQuery) {
    return this.placesRepository.listAdmin(query);
  }

  async createPlace(dto: CreatePlaceDto) {
    await this.assertCategoryExists(dto.categoryId);
    if (dto.areaId) await this.assertAreaExists(dto.areaId);
    const slug = dto.slug ?? (await this.generateSlug(dto.nameEn));
    await this.assertSlugFree(slug);
    return this.placesRepository.create({ ...dto, slug });
  }

  async updatePlace(id: string, dto: UpdatePlaceDto) {
    await this.getPlace(id);
    if (dto.categoryId) await this.assertCategoryExists(dto.categoryId);
    if (dto.areaId) await this.assertAreaExists(dto.areaId);
    if (dto.slug) await this.assertSlugFree(dto.slug, id);
    return this.placesRepository.update(id, dto);
  }

  async removePlace(id: string) {
    const place = await this.getPlace(id);
    await this.placesRepository.delete(id);
    await this.uploads.deleteMany(place.photos);
  }

  private async generateSlug(nameEn?: string): Promise<string> {
    // Collision-safe without a retry loop: check the taken slugs once.
    // A concurrent insert can still hit the unique constraint; Prisma
    // surfaces that as an error and the admin retries the save.
    const taken = await this.placesRepository.listSlugs();
    return buildPlaceSlug({ nameEn, taken: new Set(taken) });
  }

  private async assertSlugFree(slug: string, exceptId?: string) {
    const taken = await this.placesRepository.slugTaken(slug, exceptId);
    if (taken) throw new ConflictException(`Slug "${slug}" is already used by another place`);
  }

  private async getPlace(id: string) {
    const place = await this.placesRepository.findById(id);
    if (!place) throw new NotFoundException(`Place ${id} not found`);
    return place;
  }

  private async assertCategoryExists(categoryId: string) {
    const category = await this.placesRepository.categoryExists(categoryId);
    if (!category) throw new BadRequestException(`Category ${categoryId} does not exist`);
  }

  private async assertAreaExists(areaId: string) {
    const area = await this.placesRepository.areaExists(areaId);
    if (!area) throw new BadRequestException(`Area ${areaId} does not exist`);
  }
}
