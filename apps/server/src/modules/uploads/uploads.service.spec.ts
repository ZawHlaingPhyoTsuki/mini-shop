import { DeleteObjectCommand, PutObjectCommand, type S3Client } from "@aws-sdk/client-s3";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UploadsService } from "./uploads.service.js";

vi.mock("../../env.server.js", () => ({
  ENV: {
    AWS_ENDPOINT_URL_S3: "https://storage.example.test",
    AWS_REGION: "ap-southeast-1",
    AWS_ACCESS_KEY_ID: "test-access-key",
    AWS_SECRET_ACCESS_KEY: "test-secret-key",
    NEON_BUCKET_NAME: "tcl-guide-images",
  },
}));

const { getSignedUrl } = vi.hoisted(() => ({
  getSignedUrl: vi.fn(),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({ getSignedUrl }));

function spySend(service: UploadsService) {
  return vi
    .spyOn((service as unknown as { s3: S3Client }).s3, "send")
    .mockResolvedValue({} as never);
}

const MANAGED_URL =
  "https://storage.example.test/tcl-guide-images/places/b114d0df-47a9-459f-a52b-78b2dafd0ea5.png";

describe("UploadsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSignedUrl.mockResolvedValue("https://signed.example.test/upload");
  });

  it("presigns a PUT scoped to the bucket, key and content type", async () => {
    const service = new UploadsService();
    await service.createUpload({ contentType: "image/png" });

    expect(getSignedUrl).toHaveBeenCalledTimes(1);
    const [client, command, options] = getSignedUrl.mock.calls[0] as [
      unknown,
      PutObjectCommand,
      { expiresIn: number },
    ];
    expect(command).toBeInstanceOf(PutObjectCommand);
    expect(command.input).toMatchObject({
      Bucket: "tcl-guide-images",
      ContentType: "image/png",
    });
    expect(command.input.Key).toMatch(/^places\/[0-9a-f-]{36}\.png$/);
    expect(options).toEqual({ expiresIn: 300 });
    expect(client).toBeDefined();
  });

  it("maps image/jpeg to a .jpg key", async () => {
    const service = new UploadsService();
    const result = await service.createUpload({ contentType: "image/jpeg" });

    expect(result.url).toMatch(/\.jpg$/);
  });

  it("returns the public path-style url for the uploaded object", async () => {
    const service = new UploadsService();
    const result = await service.createUpload({ contentType: "image/webp" });

    expect(result.uploadUrl).toBe("https://signed.example.test/upload");
    expect(result.url).toMatch(
      /^https:\/\/storage\.example\.test\/tcl-guide-images\/places\/[0-9a-f-]{36}\.webp$/,
    );
  });

  it("deletes the object for a managed url", async () => {
    const service = new UploadsService();
    const send = spySend(service);

    await expect(service.deleteUpload({ url: MANAGED_URL })).resolves.toEqual({
      deleted: true,
    });
    expect(send).toHaveBeenCalledTimes(1);
    const command = send.mock.calls[0][0] as DeleteObjectCommand;
    expect(command).toBeInstanceOf(DeleteObjectCommand);
    expect(command.input).toEqual({
      Bucket: "tcl-guide-images",
      Key: "places/b114d0df-47a9-459f-a52b-78b2dafd0ea5.png",
    });
  });

  it("rejects urls outside the managed bucket", async () => {
    const service = new UploadsService();
    const send = spySend(service);

    await expect(
      service.deleteUpload({ url: "https://images.unsplash.com/photo-123" }),
    ).rejects.toThrow("URL is not a managed upload");
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects managed-prefix urls with an unexpected key shape", async () => {
    const service = new UploadsService();
    const send = spySend(service);

    await expect(
      service.deleteUpload({ url: "https://storage.example.test/tcl-guide-images/other/file.png" }),
    ).rejects.toThrow("URL is not a managed upload");
    expect(send).not.toHaveBeenCalled();
  });

  it("deletes many urls while skipping foreign ones", async () => {
    const service = new UploadsService();
    const send = spySend(service);

    await service.deleteMany([MANAGED_URL, "https://images.unsplash.com/photo-123", MANAGED_URL]);
    expect(send).toHaveBeenCalledTimes(2);
  });
});
