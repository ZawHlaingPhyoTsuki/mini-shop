import { Controller, Get } from "@nestjs/common";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

import { CategoriesPublicService } from "./categories-public.service.js";

@Controller("categories")
@AllowAnonymous()
export class CategoriesPublicController {
  constructor(private readonly categories: CategoriesPublicService) {}

  @Get()
  list() {
    return this.categories.list();
  }
}
