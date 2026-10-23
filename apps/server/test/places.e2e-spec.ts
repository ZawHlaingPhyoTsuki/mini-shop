import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import type { Response } from "supertest";
import { App } from "supertest/types.js";
import { AppModule } from "./../src/app.module.js";
import { setupApp } from "./../src/app.setup.js";
import { PrismaService } from "./../src/prisma/prisma.service.js";
import { authed, signIn, signUp } from "./helpers.js";

describe("Places (e2e)", () => {
  let app: INestApplication<App>;
  let db: PrismaService;
  const tag = Date.now().toString(36);
  const adminEmail = `places-admin-${tag}@example.com`;
  const userEmail = `places-user-${tag}@example.com`;
  const categorySlug = `cafes-${tag}`;

  let admin: ReturnType<typeof authed>;
  let user: ReturnType<typeof authed>;
  let categoryId: string;
  let areaId: string;
  const areaSlug = `san-sai-${tag}`;
  let activePlaceId: string;
  const createdPlaceIds: string[] = [];
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
    db = moduleFixture.get(PrismaService);

    const server = app.getHttpServer();
    createdUserIds.push(await signUp(server, "Places Admin", adminEmail));
    await db.user.update({ where: { email: adminEmail }, data: { role: "admin" } });
    admin = authed(server, await signIn(server, adminEmail));

    createdUserIds.push(await signUp(server, "Places User", userEmail));
    user = authed(server, await signIn(server, userEmail));

    const category = await db.category.create({
      data: { slug: categorySlug, nameMy: `ကော်ဖီဆိုင် ${tag}`, nameEn: `Cafes ${tag}` },
    });
    categoryId = category.id;

    const area = await db.area.create({
      data: { slug: areaSlug, nameMy: `ဆန်ဆိုင်း ${tag}` },
    });
    areaId = area.id;

    const active = await admin
      .post("/admin/places")
      .send({ nameMy: `Active Place ${tag}`, categoryId, areaId })
      .expect(201);
    activePlaceId = (active.body as { id: string }).id;
    createdPlaceIds.push(activePlaceId);

    const inactive = await admin
      .post("/admin/places")
      .send({ nameMy: `Inactive Place ${tag}`, categoryId, isActive: false })
      .expect(201);
    createdPlaceIds.push((inactive.body as { id: string }).id);
  }, 60000);

  afterAll(async () => {
    await db.place.deleteMany({ where: { id: { in: createdPlaceIds } } });
    await db.category.deleteMany({ where: { id: categoryId } });
    await db.area.deleteMany({ where: { id: areaId } });
    await db.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await app.close();
  });

  describe("public reads", () => {
    it("GET /places lists only active places with their category", async () => {
      const res = await request(app.getHttpServer()).get("/places").expect(200);
      const names = (res.body as { nameMy: string }[]).map((p) => p.nameMy);
      expect(names).toContain(`Active Place ${tag}`);
      expect(names).not.toContain(`Inactive Place ${tag}`);
      const active = (res.body as { nameMy: string; category: { slug: string } }[]).find(
        (p) => p.nameMy === `Active Place ${tag}`,
      );
      expect(active?.category.slug).toBe(categorySlug);
    });

    it("GET /places filters by category slug and area", async () => {
      await request(app.getHttpServer())
        .get(`/places?category=${categorySlug}`)
        .expect(200)
        .expect((res: Response) => {
          if (!(res.body as unknown[]).length) throw new Error("expected results");
        });
      await request(app.getHttpServer())
        .get("/places?category=no-such-category")
        .expect(200)
        .expect([]);
      await request(app.getHttpServer())
        .get(`/places?area=${areaSlug}`)
        .expect(200)
        .expect((res: Response) => {
          if (!(res.body as unknown[]).length) throw new Error("expected results");
        });
    });

    it("GET /places/:id returns the place, unknown id returns 404", async () => {
      await request(app.getHttpServer())
        .get(`/places/${activePlaceId}`)
        .expect(200)
        .expect((res: Response) => {
          if ((res.body as { id: string }).id !== activePlaceId) throw new Error("wrong place");
        });
      await request(app.getHttpServer()).get("/places/does-not-exist").expect(404);
    });

    it("GET /categories lists categories", async () => {
      const res = await request(app.getHttpServer()).get("/categories").expect(200);
      const slugs = (res.body as { slug: string }[]).map((c) => c.slug);
      expect(slugs).toContain(categorySlug);
    });
  });

  describe("admin writes", () => {
    it("POST /places requires authentication (401) and admin role (403)", async () => {
      await request(app.getHttpServer())
        .post("/admin/places")
        .send({ nameMy: "Nope", categoryId })
        .expect(401);
      await user.post("/admin/places").send({ nameMy: "Nope", categoryId }).expect(403);
    });

    it("POST /places validates input (400) and rejects unknown categories", async () => {
      await admin.post("/admin/places").send({ categoryId }).expect(400);
      await admin
        .post("/admin/places")
        .send({ nameMy: "Nope", categoryId: "does-not-exist" })
        .expect(400);
    });

    it("POST /places creates with defaults as admin (201)", async () => {
      const res = await admin
        .post("/admin/places")
        .send({ nameMy: `Created ${tag}`, categoryId, photos: [] })
        .expect(201);
      const body = res.body as { id: string; isActive: boolean; photos: string[] };
      expect(body.isActive).toBe(true);
      createdPlaceIds.push(body.id);
    });

    it("PATCH /places/:id updates as admin, 404 for unknown, 403 for users", async () => {
      await admin
        .patch(`/admin/places/${activePlaceId}`)
        .send({ phone: "099123456" })
        .expect(200)
        .expect((res: Response) => {
          if ((res.body as { phone: string }).phone !== "099123456") {
            throw new Error("phone not updated");
          }
        });
      await admin.patch("/admin/places/does-not-exist").send({ phone: "1" }).expect(404);
      await user.patch(`/admin/places/${activePlaceId}`).send({ phone: "1" }).expect(403);
    });

    it("DELETE /places/:id removes as admin, 403 for users", async () => {
      const res = await admin
        .post("/admin/places")
        .send({ nameMy: `Doomed ${tag}`, categoryId })
        .expect(201);
      const id = (res.body as { id: string }).id;
      await user.delete(`/admin/places/${id}`).expect(403);
      await admin.delete(`/admin/places/${id}`).expect(200);
      await request(app.getHttpServer()).get(`/places/${id}`).expect(404);
    });
  });
});
