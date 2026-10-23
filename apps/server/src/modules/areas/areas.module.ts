import { Module } from "@nestjs/common";

import { AreasAdminController } from "./areas-admin.controller.js";
import { AreasAdminService } from "./areas-admin.service.js";

@Module({
  controllers: [AreasAdminController],
  providers: [AreasAdminService],
})
export class AreasModule {}
