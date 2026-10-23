import { Body, Controller, Delete, HttpCode, Post } from "@nestjs/common";
import { Roles } from "@thallesp/nestjs-better-auth";

import {
  deleteUploadSchema,
  uploadRequestSchema,
  type DeleteUploadDto,
  type UploadRequestDto,
} from "./uploads.schemas.js";
import { UploadsService } from "./uploads.service.js";

@Controller("admin/uploads")
@Roles(["admin"])
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post()
  create(@Body({ schema: uploadRequestSchema }) dto: UploadRequestDto) {
    return this.uploads.createUpload(dto);
  }

  @Delete()
  @HttpCode(200)
  remove(@Body({ schema: deleteUploadSchema }) dto: DeleteUploadDto) {
    return this.uploads.deleteUpload(dto);
  }
}
