import "varlock/auto-load";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/client.js";
import { ENV } from "../src/env.server.js";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: ENV.DATABASE_URL }),
});

const categories = [
  { slug: "fashion", nameEn: "Fashion", nameMy: "ဖက်ရှင်", sortOrder: 10 },
  { slug: "beauty", nameEn: "Beauty", nameMy: "အလှအပ", sortOrder: 20 },
  { slug: "home-living", nameEn: "Home & Living", nameMy: "အိမ်သုံးပစ္စည်း", sortOrder: 30 },
  { slug: "food-drink", nameEn: "Food & Drink", nameMy: "အစားအသောက်", sortOrder: 40 },
] as const;

async function main() {
  for (const category of categories) {
    await db.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  const admin = await db.user.findUnique({ where: { email: ENV.ADMIN_EMAIL } });
  if (!admin) {
    throw new Error(
      `ADMIN_EMAIL ${ENV.ADMIN_EMAIL} has not signed up yet. Sign up, then rerun the seed.`,
    );
  }
  await db.user.update({ where: { id: admin.id }, data: { role: "admin" } });
}

await main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
