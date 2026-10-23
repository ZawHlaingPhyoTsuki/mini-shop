import { Module } from "@nestjs/common";

import { ShopsAdminController } from "./shops-admin.controller.js";
import { ShopsController } from "./shops.controller.js";
import { ShopsService } from "./shops.service.js";

@Module({
  controllers: [ShopsController, ShopsAdminController],
  providers: [ShopsService],
})
export class ShopsModule {}
