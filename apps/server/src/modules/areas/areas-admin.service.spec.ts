import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { AreasAdminService } from "./areas-admin.service.js";

function area(overrides: Record<string, unknown> = {}) {
  return {
    id: "area1",
    slug: "san-sai",
    nameMy: "San Sai",
    nameEn: null,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { places: 0 },
    ...overrides,
  };
}

function makeService() {
  const areaDelegate = {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    aggregate: vi.fn().mockResolvedValue({ _max: { sortOrder: 2 } }),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const db = { area: areaDelegate } as unknown as PrismaService;
  return { areaDb: areaDelegate, service: new AreasAdminService(db) };
}

describe("AreasAdminService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps the place count onto each area", async () => {
    const { areaDb, service } = makeService();
    areaDb.findMany.mockResolvedValue([area({ _count: { places: 3 } })]);

    await expect(service.list()).resolves.toEqual([
      expect.objectContaining({ slug: "san-sai", placeCount: 3 }),
    ]);
  });

  it("appends a new area after the latest order", async () => {
    const { areaDb, service } = makeService();
    areaDb.findUnique.mockResolvedValue(null);
    areaDb.create.mockImplementation(async (args: { data: Record<string, unknown> }) =>
      area(args.data),
    );

    await service.create({ slug: "riverside", nameMy: "Riverside" });

    expect(areaDb.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: "riverside", sortOrder: 3 }),
      }),
    );
  });

  it("respects an explicit sort order on create", async () => {
    const { areaDb, service } = makeService();
    areaDb.findUnique.mockResolvedValue(null);
    areaDb.create.mockImplementation(async (args: { data: Record<string, unknown> }) =>
      area(args.data),
    );

    await service.create({ slug: "riverside", nameMy: "Riverside", sortOrder: 0 });

    expect(areaDb.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ sortOrder: 0 }) }),
    );
    expect(areaDb.aggregate).not.toHaveBeenCalled();
  });

  it("rejects a duplicate slug with a conflict", async () => {
    const { areaDb, service } = makeService();
    areaDb.findUnique.mockResolvedValue(area());

    await expect(service.create({ slug: "san-sai", nameMy: "x" })).rejects.toThrow(
      ConflictException,
    );
    expect(areaDb.create).not.toHaveBeenCalled();
  });

  it("rejects deleting an area that still has places", async () => {
    const { areaDb, service } = makeService();
    areaDb.findUnique.mockResolvedValue(area({ _count: { places: 2 } }));

    await expect(service.remove("area1")).rejects.toThrow(BadRequestException);
    expect(areaDb.delete).not.toHaveBeenCalled();
  });

  it("deletes an empty area", async () => {
    const { areaDb, service } = makeService();
    areaDb.findUnique.mockResolvedValue(area());

    await expect(service.remove("area1")).resolves.toBeUndefined();
    expect(areaDb.delete).toHaveBeenCalledWith({ where: { id: "area1" } });
  });

  it("updates the sort order when reordering", async () => {
    const { areaDb, service } = makeService();
    areaDb.findUnique.mockResolvedValue(area());
    areaDb.update.mockImplementation(async (args: { data: Record<string, unknown> }) =>
      area(args.data),
    );

    await service.update("area1", { nameMy: "San Sai", sortOrder: 2 });

    expect(areaDb.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "area1" },
        data: expect.objectContaining({ nameMy: "San Sai", sortOrder: 2 }),
      }),
    );
  });

  it("turns an unknown area into a not-found error", async () => {
    const { areaDb, service } = makeService();
    areaDb.findUnique.mockResolvedValue(null);

    await expect(service.update("missing", { nameMy: "x" })).rejects.toThrow(NotFoundException);
  });
});
