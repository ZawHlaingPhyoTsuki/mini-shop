import { Module } from "@nestjs/common";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { AppController } from "./app.controller.js";
import { createAuth } from "./auth.js";
import { CategoriesModule } from "./modules/categories/categories.module.js";
import { ENV } from "./env.server.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { PrismaService } from "./prisma/prisma.service.js";
import { ProductsModule } from "./modules/products/products.module.js";
import { ShopsModule } from "./modules/shops/shops.module.js";

@Module({
  imports: [
    PrismaModule,
    AuthModule.forRootAsync({
      imports: [PrismaModule],
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => ({ auth: createAuth(ENV, prisma) }),
    }),
    CategoriesModule,
    ShopsModule,
    ProductsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
