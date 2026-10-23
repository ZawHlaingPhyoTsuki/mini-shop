// Starter directory content for Tachileik. Entries are representative and
// meant to be curated with on-the-ground knowledge; Myanmar strings in
// particular deserve a native-speaker review pass.
import "varlock/auto-load";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient, type Prisma } from "../src/generated/client.js";
import { ENV } from "../src/env.server.js";
import { buildPlaceSlug } from "../src/modules/places/place-slug.js";
import { createPlaceSchema } from "../src/modules/places/places.schemas.js";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: ENV.DATABASE_URL }),
});

type SeedCategory = { slug: string; nameMy: string; nameEn: string };

const categories: SeedCategory[] = [
  { slug: "restaurant", nameMy: "စားသောက်ဆိုင်", nameEn: "Restaurant" },
  { slug: "cafe", nameMy: "ကော်ဖီဆိုင်", nameEn: "Cafe" },
  { slug: "bakery", nameMy: "မုန့်ဆိုင်", nameEn: "Bakery" },
  { slug: "street_food", nameMy: "လမ်းဘေးအစားအစာ", nameEn: "Street Food" },
  { slug: "bar", nameMy: "ဘား", nameEn: "Bar" },
  { slug: "hotel", nameMy: "ဟိုတယ်", nameEn: "Hotel" },
  { slug: "shop", nameMy: "ဆိုင်", nameEn: "Shop" },
];

type SeedArea = { slug: string; nameMy: string };

const areas: SeedArea[] = [
  { slug: "night-market", nameMy: "Night Market" },
  { slug: "san-sai", nameMy: "San Sai" },
  { slug: "border-gate", nameMy: "Border Gate" },
  { slug: "taloke-market", nameMy: "Taloke Market" },
  { slug: "riverside", nameMy: "Riverside" },
  { slug: "town-center", nameMy: "Town Center" },
];

type SeedPlace = {
  nameMy: string;
  nameEn?: string;
  descriptionMy?: string;
  category: string;
  area?: string;
  addressText?: string;
  phone?: string;
  phoneSecondary?: string;
  facebookUrl?: string;
  telegramHandle?: string;
  hoursText?: string;
  priceLevel?: "LOW" | "MID" | "HIGH";
  priceNote?: string;
  latitude?: number;
  longitude?: number;
};

const places: SeedPlace[] = [
  {
    nameMy: "တာချီလိတ် ညဈေး အစားအစာတန်း",
    nameEn: "Tachileik Night Market Food Stalls",
    descriptionMy: "ညဘက်ဖွင့်သော လမ်းဘေးအစားအစာများ",
    category: "street_food",
    area: "Night Market",
    phone: "09971234567",
    facebookUrl: "https://facebook.com/tclnightmarketfood",
    telegramHandle: "tclnightmarket",
    hoursText: "Evenings",
    priceLevel: "LOW",
    priceNote: "1,000-3,000 Ks per person",
    latitude: 20.4482,
    longitude: 99.8831,
  },
  {
    nameMy: "ရှမ်းခေါက်ဆွဲဆိုင်",
    nameEn: "Shan Noodle Shop",
    descriptionMy: "ရှမ်းခေါက်ဆွဲနှင့် ဒေသအစားအစာများ",
    category: "restaurant",
    area: "San Sai",
    phone: "09881234567",
    facebookUrl: "https://facebook.com/shannoodlesansai",
    telegramHandle: "shannoodlesansai",
    hoursText: "7:00 - 20:00",
    priceLevel: "LOW",
    priceNote: "2,000-5,000 Ks per person",
    latitude: 20.4448,
    longitude: 99.8796,
  },
  {
    nameMy: "နယ်စပ်ဂိတ် ကော်ဖီဆိုင်",
    nameEn: "Border Gate Cafe",
    descriptionMy: "ကော်ဖီနှင့် အအေးမျိုးစုံ ရနိုင်ပါသည်",
    category: "cafe",
    area: "Border Gate",
    phone: "09771234567",
    facebookUrl: "https://facebook.com/bordergatecafe",
    hoursText: "8:00 - 21:00",
    priceLevel: "MID",
    latitude: 20.4459,
    longitude: 99.8862,
  },
  {
    nameMy: "တာလုတ်ဈေး မုန့်ဆိုင်",
    nameEn: "Taloke Market Bakery",
    descriptionMy: "နေ့တိုင်းလတ်ဆတ်သော မုန့်မျိုးစုံ",
    category: "bakery",
    area: "Taloke Market",
    phone: "09661234567",
    telegramHandle: "talokebakery",
    hoursText: "6:30 - 18:00",
    priceLevel: "LOW",
    latitude: 20.4504,
    longitude: 99.8787,
  },
  {
    nameMy: "မဲခေါင် မြစ်ကမ်း စားသောက်ဆိုင်",
    nameEn: "Mekong Riverside Restaurant",
    descriptionMy: "မြစ်ကမ်းဘေးတွင် အစားအသောက်နှင့် ရှုခင်းကောင်းများ",
    category: "restaurant",
    area: "Riverside",
    phone: "09551234567",
    phoneSecondary: "09551234568",
    facebookUrl: "https://facebook.com/mekongriversidetcl",
    telegramHandle: "mekongriversidetcl",
    hoursText: "10:00 - 22:00",
    priceLevel: "MID",
    priceNote: "5,000-15,000 Ks per person",
    latitude: 20.4417,
    longitude: 99.8759,
  },
  {
    nameMy: "ဆန်ဆိုင်း လက်ဖက်ရည်ဆိုင်",
    nameEn: "San Sai Teashop",
    descriptionMy: "မြန်မာ လက်ဖက်ရည်နှင့် မုန့်များ",
    category: "cafe",
    area: "San Sai",
    phone: "09441234567",
    hoursText: "6:00 - 18:00",
    priceLevel: "LOW",
    latitude: 20.4436,
    longitude: 99.8814,
  },
  {
    nameMy: "ဟိုတယ် စားသောက်ဆိုင်",
    nameEn: "Hotel Restaurant",
    descriptionMy: "သန့်ရှင်းပြီး ဧည့်ခံမှုကောင်းသော စားသောက်ဆိုင်",
    category: "hotel",
    area: "Town Center",
    phone: "09331234567",
    facebookUrl: "https://facebook.com/tclhotelrestaurant",
    hoursText: "6:30 - 22:00",
    priceLevel: "HIGH",
    priceNote: "15,000 Ks and above",
    latitude: 20.4472,
    longitude: 99.8848,
  },
  {
    nameMy: "ည ဘား",
    nameEn: "Night Bar",
    descriptionMy: "ညဘက်အနားယူရန် သင့်တော်သောနေရာ",
    category: "bar",
    area: "Town Center",
    phone: "09221234567",
    telegramHandle: "tclnightbar",
    hoursText: "18:00 - 23:00",
    priceLevel: "MID",
    latitude: 20.4491,
    longitude: 99.8875,
  },
  {
    nameMy: "ဒေသထွက် ပစ္စည်းဆိုင်",
    nameEn: "Local Products Shop",
    descriptionMy: "ဒေသထွက်အစားအစာနှင့် လက်ဆောင်ပစ္စည်းများ",
    category: "shop",
    area: "Taloke Market",
    phone: "09111234567",
    hoursText: "8:00 - 19:00",
    priceLevel: "LOW",
    latitude: 20.4512,
    longitude: 99.8819,
  },
  {
    nameMy: "ခေါက်ဆွဲကြော် ဆိုင်",
    nameEn: "Fried Noodle Stall",
    descriptionMy: "ညနေပိုင်းဖွင့်သော ခေါက်ဆွဲကြော်ဆိုင်",
    category: "street_food",
    area: "Night Market",
    phone: "09011234567",
    facebookUrl: "https://facebook.com/friednoodlestall",
    hoursText: "Evenings",
    priceLevel: "LOW",
    latitude: 20.4465,
    longitude: 99.8891,
  },
];

async function main() {
  const idsBySlug = new Map<string, string>();
  for (const category of categories) {
    const saved = await db.category.upsert({
      where: { slug: category.slug },
      update: { nameMy: category.nameMy, nameEn: category.nameEn },
      create: category,
    });
    idsBySlug.set(saved.slug, saved.id);
  }
  console.log(`categories: ${idsBySlug.size} upserted`);

  const areaIdsByName = new Map<string, string>();
  for (const [index, area] of areas.entries()) {
    const saved = await db.area.upsert({
      where: { slug: area.slug },
      update: { nameMy: area.nameMy },
      create: { ...area, sortOrder: index },
    });
    areaIdsByName.set(saved.nameMy.toLowerCase(), saved.id);
  }
  console.log(`areas: ${areaIdsByName.size} upserted`);

  const takenSlugs = new Set(
    (await db.place.findMany({ select: { slug: true } })).map((p) => p.slug),
  );

  let created = 0;
  let skipped = 0;
  for (const place of places) {
    const { category: slug, area, ...rest } = place;
    const categoryId = idsBySlug.get(slug);
    if (!categoryId) {
      throw new Error(`unknown seed category: ${slug}`);
    }
    const areaId = area ? areaIdsByName.get(area.toLowerCase()) : undefined;
    if (area && !areaId) {
      throw new Error(`unknown seed area: ${area}`);
    }
    const placeSlug = buildPlaceSlug({ nameEn: rest.nameEn, taken: takenSlugs });
    takenSlugs.add(placeSlug);
    // Same validation as the write API: seeds can't smuggle invalid shapes.
    const data = createPlaceSchema.parse({ ...rest, categoryId, areaId, photos: [] });
    const existing = await db.place.findFirst({
      where: { nameMy: data.nameMy, categoryId },
    });
    if (existing) {
      // Fill gaps only, never overwrite: curated edits survive re-seeds.
      const patch: Prisma.PlaceUpdateInput = {};
      if (existing.latitude === null || existing.longitude === null) {
        patch.latitude = data.latitude;
        patch.longitude = data.longitude;
      }
      for (const key of [
        "phone",
        "phoneSecondary",
        "facebookUrl",
        "telegramHandle",
        "descriptionMy",
        "priceNote",
        "priceLevel",
        "areaId",
      ] as const) {
        if (existing[key] == null && data[key] != null) {
          (patch as Record<string, unknown>)[key] = data[key];
        }
      }
      if (Object.keys(patch).length > 0) {
        await db.place.update({ where: { id: existing.id }, data: patch });
      }
      skipped += 1;
      continue;
    }
    await db.place.create({ data: { ...data, slug: placeSlug } });
    created += 1;
  }
  console.log(`places: ${created} created, ${skipped} skipped`);

  const admin = await db.user.findUnique({ where: { email: ENV.ADMIN_EMAIL } });
  if (!admin) {
    throw new Error(
      `ADMIN_EMAIL ${ENV.ADMIN_EMAIL} has not signed up yet. Sign up first, then re-run the seed.`,
    );
  }
  await db.user.update({ where: { id: admin.id }, data: { role: "admin" } });
  console.log(`admin: ${ENV.ADMIN_EMAIL} promoted`);
}

await main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
