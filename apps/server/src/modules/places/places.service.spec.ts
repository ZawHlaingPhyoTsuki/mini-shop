import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../prisma/prisma.service.js";
import type { UploadsService } from "../uploads/uploads.service.js";
import { PlacesAdminService } from "./places-admin.service.js";
import { PlacesPublicService } from "./places-public.service.js";
import { PlacesRepository } from "./places.repository.js";

const { db } = vi.hoisted(() => ({
  db: {
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    place: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("PlacesRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filters public places to active records", () => {
    const repository = new PlacesRepository(db as unknown as PrismaService);
    repository.listPublic({});

    expect(db.place.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
      }),
    );
  });

  it("lists admin places without the active filter", () => {
    const repository = new PlacesRepository(db as unknown as PrismaService);
    repository.listAdmin({ category: "bakery", area: "san-sai" });

    expect(db.place.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: { slug: "bakery" },
          area: { slug: "san-sai" },
        }),
      }),
    );
  });
});

describe("PlacesAdminService", () => {
  it("returns directory summary metrics", async () => {
    const places = {
      getSummary: vi.fn().mockResolvedValue({
        allPlaces: 5,
        publishedPlaces: 3,
        areasCovered: 2,
      }),
    } as Pick<PlacesRepository, "getSummary">;
    const uploads = { deleteMany: vi.fn() } as Pick<UploadsService, "deleteMany">;
    const service = new PlacesAdminService(places as PlacesRepository, uploads as UploadsService);

    await expect(service.getSummary()).resolves.toEqual({
      allPlaces: 5,
      publishedPlaces: 3,
      hiddenPlaces: 2,
      areasCovered: 2,
    });
  });

  it("deletes the database row before its photos from storage", async () => {
    const place = { id: "p1", photos: ["https://storage.example.test/photo.png"] };
    const order: string[] = [];
    const repository = {
      findById: vi.fn().mockResolvedValue(place),
      delete: vi.fn().mockImplementation(async () => {
        order.push("row");
        return place;
      }),
    } as Pick<PlacesRepository, "findById" | "delete">;
    const uploads = {
      deleteMany: vi.fn().mockImplementation(async () => {
        order.push("objects");
        return { deleted: true };
      }),
    } as Pick<UploadsService, "deleteMany">;
    const service = new PlacesAdminService(
      repository as PlacesRepository,
      uploads as UploadsService,
    );

    await service.removePlace("p1");

    expect(repository.delete).toHaveBeenCalledWith("p1");
    expect(uploads.deleteMany).toHaveBeenCalledWith(place.photos);
    expect(order).toEqual(["row", "objects"]);
  });
});

describe("PlacesPublicService", () => {
  it("turns a missing public place into a not-found error", async () => {
    const places = {
      findPublic: vi.fn().mockResolvedValue(null),
    } as Pick<PlacesRepository, "findPublic">;
    const service = new PlacesPublicService(places as PlacesRepository);

    await expect(service.getPlace("missing")).rejects.toThrow("Place missing not found");
  });
});
