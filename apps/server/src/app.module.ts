import { Module } from "@nestjs/common";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { AppController } from "./app.controller.js";
import { createAuth } from "./auth.js";
import { AreasModule } from "./modules/areas/areas.module.js";
import { CategoriesModule } from "./modules/categories/categories.module.js";
import { ENV } from "./env.server.js";
import { PlacesModule } from "./modules/places/places.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { PrismaService } from "./prisma/prisma.service.js";
import { UploadsModule } from "./modules/uploads/uploads.module.js";

@Module({
  imports: [
    PrismaModule,
    AuthModule.forRootAsync({
      imports: [PrismaModule],
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => ({ auth: createAuth(ENV, prisma) }),
    }),
    PlacesModule,
    CategoriesModule,
    AreasModule,
    UploadsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
