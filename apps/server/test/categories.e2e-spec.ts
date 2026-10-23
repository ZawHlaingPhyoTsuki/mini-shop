import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { App } from "supertest/types.js";
import { AppModule } from "./../src/app.module.js";
import { setupApp } from "./../src/app.setup.js";
import { PrismaService } from "./../src/prisma/prisma.service.js";
import { authed, signIn, signUp } from "./helpers.js";

describe("Categories (e2e)", () => {
  let app: INestApplication<App>;
  let db: PrismaService;
  const tag = Date.now().toString(36);
  const slug = `test_cat_${tag}`;
  const adminEmail = `categories-admin-${tag}@example.com`;

  let admin: ReturnType<typeof authed>;
  let categoryId: string;
  const createdPlaceIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
    db = moduleFixture.get(PrismaService);

    const server = app.getHttpServer();
    const userId = await signUp(server, "Categories Admin", adminEmail);
    await db.user.update({ where: { id: userId }, data: { role: "admin" } });
    admin = authed(server, await signIn(server, adminEmail));
  }, 60000);

  afterAll(async () => {
    await db.place.deleteMany({ where: { id: { in: createdPlaceIds } } });
    await db.category.deleteMany({ where: { slug: { startsWith: `test_cat_${tag}` } } });
    await db.user.deleteMany({ where: { email: adminEmail } });
    await app.close();
  });

  it("validates the slug format (400)", async () => {
    await admin.post("/admin/categories").send({ slug: "Bad Slug!", nameMy: "မှားသည်" }).expect(400);
  });

  it("creates a category with a place count of zero (201)", async () => {
    const res = await admin
      .post("/admin/categories")
      .send({ slug, nameMy: "စမ်းသပ်ဆိုင်", nameEn: `Test Category ${tag}` })
      .expect(201);
    const body = res.body as { id: string; slug: string; placeCount: number };
    expect(body.slug).toBe(slug);
    expect(body.placeCount).toBe(0);
    categoryId = body.id;
  });

  it("rejects a duplicate slug (409)", async () => {
    await admin.post("/admin/categories").send({ slug, nameMy: "ထပ်မံထည့်သည်" }).expect(409);
  });

  it("lists categories with their place counts", async () => {
    const res = await admin.get("/admin/categories").expect(200);
    const found = (res.body as { slug: string; placeCount: number }[]).find(
      (category) => category.slug === slug,
    );
    expect(found).toBeDefined();
    expect(typeof found?.placeCount).toBe("number");
  });

  it("renames a category without changing its slug", async () => {
    const res = await admin
      .patch(`/admin/categories/${categoryId}`)
      .send({ nameMy: "ပြင်ဆင်ပြီး", nameEn: `Renamed ${tag}`, slug: "should-be-ignored" })
      .expect(200);
    const body = res.body as { nameMy: string; slug: string };
    expect(body.nameMy).toBe(`ပြင်ဆင်ပြီး`);
    expect(body.slug).toBe(slug);
  });

  it("returns 404 when updating an unknown category", async () => {
    await admin.patch("/admin/categories/does-not-exist").send({ nameMy: "x" }).expect(404);
  });

  it("blocks deletion while a place uses the category, then allows it", async () => {
    const place = await admin
      .post("/admin/places")
      .send({ nameMy: `Category Test Place ${tag}`, categoryId })
      .expect(201);
    const placeId = (place.body as { id: string }).id;
    createdPlaceIds.push(placeId);

    await admin.delete(`/admin/categories/${categoryId}`).expect(400);

    await admin.delete(`/admin/places/${placeId}`).expect(200);
    await admin.delete(`/admin/categories/${categoryId}`).expect(200);
  });

  it("returns 404 when deleting an unknown category", async () => {
    await admin.delete("/admin/categories/does-not-exist").expect(404);
  });
});
