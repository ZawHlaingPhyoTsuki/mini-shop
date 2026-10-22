import "varlock/auto-load";

import { createDb } from "@/db";
import { localizedNamesSchema } from "@/domain/shared/locale";
import { slugSchema } from "@/domain/shared/validation";
import { ENV } from "@/env.server";

if (ENV.NODE_ENV === "production" || ENV.NEON_BRANCH === "production") {
  if (ENV.SEED_ALLOW_PRODUCTION !== "1") {
    throw new Error("Refusing to seed production. Seed the dev branch instead.");
  }
}

const categories = [
  { slug: "fashion", names: { en: "Fashion", my: "ဖက်ရှင်" }, sortOrder: 10 },
  { slug: "beauty", names: { en: "Beauty", my: "အလှအပ" }, sortOrder: 20 },
  {
    slug: "home-living",
    names: { en: "Home & Living", my: "အိမ်နှင့် လူနေမှု" },
    sortOrder: 30,
  },
  {
    slug: "electronics",
    names: { en: "Electronics", my: "အီလက်ထရွန်နစ်" },
    sortOrder: 40,
  },
  {
    slug: "food-beverage",
    names: { en: "Food & Beverage", my: "အစားအသောက်" },
    sortOrder: 50,
  },
].map((row) => ({
  ...row,
  names: localizedNamesSchema.parse(row.names),
  slug: slugSchema.parse(row.slug),
}));

const db = createDb(ENV);

try {
  for (const category of categories) {
    await db.category.upsert({
      where: { slug: category.slug },
      update: {
        names: category.names,
        sortOrder: category.sortOrder,
        isActive: true,
      },
      create: {
        names: category.names,
        slug: category.slug,
        sortOrder: category.sortOrder,
        isActive: true,
      },
    });
  }

  console.log(`Seeded ${categories.length} categories.`);
} finally {
  await db.$disconnect();
}
