import { Controller, Get, Param, Query } from "@nestjs/common";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

import { ProductsService } from "./products.service.js";

@Controller("products")
@AllowAnonymous()
export class ProductsPublicController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(
    @Query("search") search?: string,
    @Query("category") categorySlug?: string,
    @Query("categoryId") categoryId?: string,
  ) {
    return this.products.listPublic({ search, categorySlug, categoryId });
  }

  @Get(":slug")
  getBySlug(@Param("slug") slug: string, @Query("shop") shopSlug?: string) {
    return this.products.getPublicBySlug(slug, shopSlug);
  }
}
