import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { AllowAnonymous, Session } from "@thallesp/nestjs-better-auth";

import { ShopsService } from "./shops.service.js";
import {
  createShopSchema,
  updateShopSchema,
  type CreateShopDto,
  type UpdateShopDto,
} from "./shops.schemas.js";

type AuthSession = { user: { id: string } };

@Controller("shops")
export class ShopsController {
  constructor(private readonly shops: ShopsService) {}

  @Post()
  create(@Session() session: AuthSession, @Body({ schema: createShopSchema }) dto: CreateShopDto) {
    return this.shops.create(session.user.id, dto);
  }

  @Get("me")
  getMine(@Session() session: AuthSession) {
    return this.shops.getMine(session.user.id);
  }

  @Patch("me")
  updateMine(
    @Session() session: AuthSession,
    @Body({ schema: updateShopSchema }) dto: UpdateShopDto,
  ) {
    return this.shops.updateMine(session.user.id, dto);
  }

  @Post("me/submit")
  resubmit(@Session() session: AuthSession) {
    return this.shops.resubmit(session.user.id);
  }

  @Get(":slug")
  @AllowAnonymous()
  getPublic(@Param("slug") slug: string) {
    return this.shops.getPublicBySlug(slug);
  }
}
