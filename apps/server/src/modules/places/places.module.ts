import { Module } from "@nestjs/common";

import { UploadsModule } from "../uploads/uploads.module.js";
import { PlacesAdminController } from "./places-admin.controller.js";
import { PlacesAdminService } from "./places-admin.service.js";
import { PlacesPublicController } from "./places-public.controller.js";
import { PlacesPublicService } from "./places-public.service.js";
import { PlacesRepository } from "./places.repository.js";

@Module({
  imports: [UploadsModule],
  controllers: [PlacesPublicController, PlacesAdminController],
  providers: [PlacesRepository, PlacesPublicService, PlacesAdminService],
})
export class PlacesModule {}
