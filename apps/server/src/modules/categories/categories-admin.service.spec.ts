import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { CategoriesAdminService } from "./categories-admin.service.js";

function category(overrides: Record<string, unknown> = {}) {
  return {
    id: "cat1",
    slug: "cafe",
    nameMy: "ကော်ဖီဆိုင်",
    nameEn: "Cafe",
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { places: 0 },
    ...overrides,
  };
}

function makeService() {
  const categoryDelegate = {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const db = { category: categoryDelegate } as unknown as PrismaService;
  return { categoryDb: categoryDelegate, service: new CategoriesAdminService(db) };
}

describe("CategoriesAdminService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps the place count onto each category", async () => {
    const { categoryDb, service } = makeService();
    categoryDb.findMany.mockResolvedValue([category({ _count: { places: 3 } })]);

    await expect(service.list()).resolves.toEqual([
      expect.objectContaining({ slug: "cafe", placeCount: 3 }),
    ]);
  });

  it("rejects a duplicate slug with a conflict", async () => {
    const { categoryDb, service } = makeService();
    categoryDb.findUnique.mockResolvedValue(category());

    await expect(service.create({ slug: "cafe", nameMy: "x" })).rejects.toThrow(ConflictException);
    expect(categoryDb.create).not.toHaveBeenCalled();
  });

  it("rejects deleting a category that still has places", async () => {
    const { categoryDb, service } = makeService();
    categoryDb.findUnique.mockResolvedValue(category({ _count: { places: 2 } }));

    await expect(service.remove("cat1")).rejects.toThrow(BadRequestException);
    expect(categoryDb.delete).not.toHaveBeenCalled();
  });

  it("deletes an empty category", async () => {
    const { categoryDb, service } = makeService();
    categoryDb.findUnique.mockResolvedValue(category());

    await expect(service.remove("cat1")).resolves.toBeUndefined();
    expect(categoryDb.delete).toHaveBeenCalledWith({ where: { id: "cat1" } });
  });

  it("turns an unknown category into a not-found error", async () => {
    const { categoryDb, service } = makeService();
    categoryDb.findUnique.mockResolvedValue(null);

    await expect(service.update("missing", { nameMy: "x" })).rejects.toThrow(NotFoundException);
  });
});
