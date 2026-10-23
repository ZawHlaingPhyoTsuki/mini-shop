import { ConflictException, ForbiddenException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import { ShopStatus } from "../../generated/enums.js";
import type { PrismaService } from "../../prisma/prisma.service.js";
import { ShopsService } from "./shops.service.js";

function makeService() {
  const shop = {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
  return { shop, service: new ShopsService({ shop } as unknown as PrismaService) };
}

describe("ShopsService", () => {
  it("creates a registration directly in the review queue", async () => {
    const { shop, service } = makeService();
    shop.findFirst.mockResolvedValue(null);
    shop.create.mockResolvedValue({ id: "shop-1", status: ShopStatus.PENDING_REVIEW });

    await service.create("owner-1", { name: "A Shop", slug: "a-shop" });

    expect(shop.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ownerUserId: "owner-1",
          status: ShopStatus.PENDING_REVIEW,
        }),
      }),
    );
  });

  it("does not allow a customer to create a second registration", async () => {
    const { shop, service } = makeService();
    shop.findFirst.mockResolvedValue({ ownerUserId: "owner-1", slug: "first-shop" });

    await expect(service.create("owner-1", { name: "Second", slug: "second" })).rejects.toThrow(
      ConflictException,
    );
  });

  it("only resubmits a rejected draft", async () => {
    const { shop, service } = makeService();
    shop.findUnique.mockResolvedValue({ id: "shop-1", status: ShopStatus.ACTIVE });

    await expect(service.resubmit("owner-1")).rejects.toThrow(ForbiddenException);
    expect(shop.update).not.toHaveBeenCalled();
  });

  it("requires a pending shop before approving", async () => {
    const { shop, service } = makeService();
    shop.findUnique.mockResolvedValue({ id: "shop-1", status: ShopStatus.DRAFT });

    await expect(service.approve("admin-1", "shop-1", {})).rejects.toThrow(ConflictException);
    expect(shop.update).not.toHaveBeenCalled();
  });
});
