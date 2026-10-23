import { Module } from "@nestjs/common";

import { CategoriesAdminController } from "./categories-admin.controller.js";
import { CategoriesAdminService } from "./categories-admin.service.js";
import { CategoriesPublicController } from "./categories-public.controller.js";
import { CategoriesPublicService } from "./categories-public.service.js";

@Module({
  controllers: [CategoriesAdminController, CategoriesPublicController],
  providers: [CategoriesAdminService, CategoriesPublicService],
})
export class CategoriesModule {}
