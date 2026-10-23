import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Roles, Session } from "@thallesp/nestjs-better-auth";

import { reviewShopSchema, type ReviewShopDto } from "./shops.schemas.js";
import { ShopsService } from "./shops.service.js";

type AuthSession = { user: { id: string } };

@Controller("admin/shops")
@Roles(["admin"])
export class ShopsAdminController {
  constructor(private readonly shops: ShopsService) {}

  @Get()
  list() {
    return this.shops.listForAdmin();
  }

  @Post(":id/approve")
  approve(
    @Session() session: AuthSession,
    @Param("id") id: string,
    @Body({ schema: reviewShopSchema }) dto: ReviewShopDto,
  ) {
    return this.shops.approve(session.user.id, id, dto);
  }

  @Post(":id/reject")
  reject(
    @Session() session: AuthSession,
    @Param("id") id: string,
    @Body({ schema: reviewShopSchema }) dto: ReviewShopDto,
  ) {
    return this.shops.reject(session.user.id, id, dto);
  }
}
