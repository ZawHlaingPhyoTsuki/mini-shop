import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { ENV } from "@/env.server";

export const UPLOAD_EXPIRES_IN_SECONDS = 300;
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const IMAGE_EXTENSIONS = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;

export type ImageContentType = keyof typeof IMAGE_EXTENSIONS;

let s3: S3Client | undefined;

/**
 * Returns the shared Neon S3 client.
 *
 * @returns A lazily created client using path-style bucket URLs.
 */
export function getStorage(): S3Client {
  s3 ??= new S3Client({
    forcePathStyle: true,
    endpoint: ENV.AWS_ENDPOINT_URL_S3,
    region: ENV.AWS_REGION,
    credentials: {
      accessKeyId: ENV.AWS_ACCESS_KEY_ID,
      secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
    },
  });
  return s3;
}

/**
 * Builds the public URL for an object in the assets bucket.
 *
 * @param key Server-generated object key.
 * @returns The public object URL.
 */
export function publicAssetUrl(key: string): string {
  return `${ENV.AWS_ENDPOINT_URL_S3}/${ENV.NEON_BUCKET_NAME}/${key}`;
}

/**
 * Creates a short-lived presigned URL for a browser upload.
 *
 * @param key Server-generated object key.
 * @param contentType Validated image MIME type.
 * @param size Validated file size in bytes.
 * @returns A presigned PUT URL.
 */
/**
 * Creates a short-lived presigned URL for a browser upload.
 *
 * @param key Server-generated object key.
 * @param contentType Validated image MIME type.
 * @param size Validated file size in bytes.
 * @returns A presigned PUT URL.
 */
export async function createUpload(
  key: string,
  contentType: ImageContentType,
  size: number,
): Promise<string> {
  return getSignedUrl(
    getStorage(),
    new PutObjectCommand({
      Bucket: ENV.NEON_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ContentLength: size,
    }),
    { expiresIn: UPLOAD_EXPIRES_IN_SECONDS },
  );
}

/**
 * Reads object metadata after an upload so the server can verify it.
 *
 * @param key Server-generated object key.
 * @returns The stored size and content type.
 */
/**
 * Reads object metadata after an upload so the server can verify it.
 *
 * @param key Server-generated object key.
 * @returns The stored size and content type.
 */
export async function statUpload(key: string) {
  const object = await getStorage().send(
    new HeadObjectCommand({ Bucket: ENV.NEON_BUCKET_NAME, Key: key }),
  );
  return { size: object.ContentLength ?? 0, contentType: object.ContentType ?? "" };
}

/**
 * Deletes an object from the assets bucket.
 *
 * @param key Server-generated object key.
 */
export async function deleteUpload(key: string): Promise<void> {
  await getStorage().send(new DeleteObjectCommand({ Bucket: ENV.NEON_BUCKET_NAME, Key: key }));
}
