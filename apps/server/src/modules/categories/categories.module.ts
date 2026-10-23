import { Module } from "@nestjs/common";

import { CategoriesAdminController } from "./categories-admin.controller.js";
import { CategoriesAdminService } from "./categories-admin.service.js";

@Module({
  controllers: [CategoriesAdminController],
  providers: [CategoriesAdminService],
})
export class CategoriesModule {}
