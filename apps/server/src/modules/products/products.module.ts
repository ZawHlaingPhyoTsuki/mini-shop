import { Module } from "@nestjs/common";

import { ProductsController } from "./products.controller.js";
import { ProductsPublicController } from "./products-public.controller.js";
import { ProductsService } from "./products.service.js";

@Module({
  controllers: [ProductsPublicController, ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
