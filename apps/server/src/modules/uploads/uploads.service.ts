import { randomUUID } from "node:crypto";

import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BadRequestException, Injectable } from "@nestjs/common";

import { ENV } from "../../env.server.js";
import type { DeleteUploadDto, UploadRequestDto } from "./uploads.schemas.js";

const EXPIRES_IN_SECONDS = 300;

const KEY_PATTERN = /^places\/[0-9a-f-]{36}\.(jpg|png|webp|gif|avif)$/;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

@Injectable()
export class UploadsService {
  private readonly s3 = new S3Client({
    forcePathStyle: true,
    endpoint: ENV.AWS_ENDPOINT_URL_S3,
    region: ENV.AWS_REGION,
    credentials: {
      accessKeyId: ENV.AWS_ACCESS_KEY_ID,
      secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
    },
  });

  async createUpload(dto: UploadRequestDto) {
    const key = `places/${randomUUID()}.${EXTENSIONS[dto.contentType]}`;
    const uploadUrl = await getSignedUrl(
      this.s3,
      new PutObjectCommand({
        Bucket: ENV.NEON_BUCKET_NAME,
        Key: key,
        ContentType: dto.contentType,
      }),
      { expiresIn: EXPIRES_IN_SECONDS },
    );
    return {
      uploadUrl,
      url: `${ENV.AWS_ENDPOINT_URL_S3}/${ENV.NEON_BUCKET_NAME}/${key}`,
    };
  }

  async deleteUpload(dto: DeleteUploadDto) {
    const key = this.keyFromUrl(dto.url);
    if (!key) throw new BadRequestException("URL is not a managed upload");
    await this.s3.send(new DeleteObjectCommand({ Bucket: ENV.NEON_BUCKET_NAME, Key: key }));
    return { deleted: true };
  }

  async deleteMany(urls: string[]) {
    const keys = urls
      .map((url) => this.keyFromUrl(url))
      .filter((key): key is string => key !== null);
    await Promise.all(
      keys.map((key) =>
        this.s3.send(new DeleteObjectCommand({ Bucket: ENV.NEON_BUCKET_NAME, Key: key })),
      ),
    );
  }

  private keyFromUrl(url: string): string | null {
    const prefix = `${ENV.AWS_ENDPOINT_URL_S3}/${ENV.NEON_BUCKET_NAME}/`;
    if (!url.startsWith(prefix)) return null;
    const key = url.slice(prefix.length);
    return KEY_PATTERN.test(key) ? key : null;
  }
}
