import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";

import { ProductsService } from "./products.service.js";
import {
  createProductSchema,
  updateProductSchema,
  type CreateProductDto,
  type UpdateProductDto,
} from "./products.schemas.js";

type AuthSession = { user: { id: string } };

@Controller("merchant/products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@Session() session: AuthSession) {
    return this.products.listMine(session.user.id);
  }

  @Post()
  create(
    @Session() session: AuthSession,
    @Body({ schema: createProductSchema }) dto: CreateProductDto,
  ) {
    return this.products.create(session.user.id, dto);
  }

  @Patch(":id")
  update(
    @Session() session: AuthSession,
    @Param("id") id: string,
    @Body({ schema: updateProductSchema }) dto: UpdateProductDto,
  ) {
    return this.products.update(session.user.id, id, dto);
  }
}
