import { prisma } from "@/lib/prisma";
import { auth } from "@/services";
import type { CustomerAddress, Shop } from "@/generated/prisma/client";

type Role = "admin" | "shop_owner" | "customer";

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

// Idempotent: reuses the user if the email already exists.
async function ensureUser(data: { name: string; email: string; password: string; role: Role }) {
  let user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    const result = await auth.api.signUpEmail({
      body: { name: data.name, email: data.email, password: data.password },
    });
    user = await prisma.user.findUniqueOrThrow({ where: { id: result.user.id } });
  }

  // `role` has input:false, so set it directly. Auto-verify for easy testing.
  return prisma.user.update({
    where: { id: user.id },
    data: { role: data.role, emailVerified: true, name: data.name },
  });
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Safe indexed access (works with noUncheckedIndexedAccess).
function at<T>(arr: readonly T[], i: number): T {
  const v = arr[i];
  if (v === undefined) throw new Error(`Seed data missing at index ${i}`);
  return v;
}

type DbUser = Awaited<ReturnType<typeof ensureUser>>;

const PASSWORD = "password123";

// ---------------------------------------------------------------
// Users
// ---------------------------------------------------------------
await ensureUser({
  name: "Admin User",
  email: "admin@example.com",
  password: PASSWORD,
  role: "admin",
});

const shopDefs = [
  {
    name: "Yangon Market",
    status: "ACTIVE",
    descEn: "Marketplace for Yangon-based fashion sellers",
    descMy: "ရန်ကုန်မြို့အခြေစိုက် ဖက်ရှင်ရောင်းချသူများ၏ ဈေး",
    phone: "+95 9 123 456 789",
    products: [
      {
        en: "Silk Longyi",
        my: "ပိုးလုံချည်",
        mmk: 15000,
        cat: "fashion",
        desc: "Traditional silk longyi, one size fits all",
      },
      {
        en: "Cotton Longyi",
        my: "ချည်လုံချည်",
        mmk: 8000,
        cat: "fashion",
        desc: "Everyday cotton longyi",
      },
      {
        en: "Embroidered Htamein",
        my: "ထမီ",
        mmk: 22000,
        cat: "fashion",
        desc: "Hand-embroidered htamein",
      },
      {
        en: "Linen Eingyi Shirt",
        my: null,
        mmk: 18000,
        cat: "fashion",
        desc: "Light linen eingyi shirt",
      },
      {
        en: "Vintage Scarf",
        my: null,
        mmk: 6000,
        cat: "fashion",
        desc: "Old stock scarf",
        status: "ARCHIVED",
      },
    ],
  },
  {
    name: "Mandalay Mart",
    status: "PENDING_REVIEW",
    descEn: "Shop for Mandalay crafts",
    descMy: "မန္တလေးလက်မှုပစ္စည်းဆိုင်",
    phone: "+95 9 222 333 444",
    products: [
      {
        en: "Gold Leaf Pack",
        my: "ရွှေရည်စက္ကူ",
        mmk: 5000,
        cat: "crafts",
        desc: "Mandalay gold leaf, 10 sheets",
      },
      {
        en: "Marble Buddha Statue",
        my: null,
        mmk: 45000,
        cat: "crafts",
        desc: "Small hand-carved marble statue",
      },
      {
        en: "Wooden Puppet",
        my: null,
        mmk: 25000,
        cat: "crafts",
        desc: "Traditional yoke thé marionette",
        status: "DRAFT",
      },
    ],
  },
  {
    name: "Bagan Lacquerware",
    status: "ACTIVE",
    descEn: "Authentic lacquerware from Bagan workshops",
    descMy: "ပုဂံမှ စစ်မှန်သော ယွန်းထည်များ",
    phone: "+95 9 333 444 555",
    products: [
      {
        en: "Lacquer Bowl",
        my: "ယွန်းခွက်",
        mmk: 12000,
        cat: "crafts",
        desc: "Bamboo-based lacquer bowl",
      },
      {
        en: "Lacquer Jewelry Box",
        my: "ယွန်းအဆင်တန်ဆာသေတ္တာ",
        mmk: 28000,
        cat: "crafts",
        desc: "Painted jewelry box",
      },
      { en: "Lacquer Tray", my: null, mmk: 20000, cat: "crafts", desc: "Large serving tray" },
      { en: "Lacquer Cup Set", my: null, mmk: 16000, cat: "home", desc: "Set of 4 cups" },
    ],
  },
  {
    name: "Inle Lake Weavers",
    status: "ACTIVE",
    descEn: "Lotus and cotton textiles woven at Inle Lake",
    descMy: "အင်းလေးကန်မှ ကြာချည်နှင့် ချည်ထည်များ",
    phone: "+95 9 444 555 666",
    products: [
      {
        en: "Lotus Silk Scarf",
        my: "ကြာမျှင်ပိုးပဝါ",
        mmk: 65000,
        cat: "fashion",
        desc: "Rare lotus-fiber scarf",
      },
      {
        en: "Woven Shoulder Bag",
        my: "ပခုံးလွယ်အိတ်",
        mmk: 14000,
        cat: "fashion",
        desc: "Shan-style woven bag",
      },
      {
        en: "Cotton Table Runner",
        my: null,
        mmk: 9000,
        cat: "home",
        desc: "Handwoven table runner",
      },
      {
        en: "Floor Cushion Cover",
        my: null,
        mmk: 7500,
        cat: "home",
        desc: "Colorful cushion cover",
      },
    ],
  },
  {
    name: "Shan Tea House",
    status: "ACTIVE",
    descEn: "Teas, snacks and ready meals from Shan State",
    descMy: "ရှမ်းပြည်နယ်မှ လက်ဖက်၊ အစားအစာများ",
    phone: "+95 9 555 666 777",
    products: [
      {
        en: "Mohinga Bowl",
        my: "မုန့်ဟင်းခါး",
        mmk: 2000,
        cat: "food",
        desc: "Traditional Burmese fish-noodle soup",
      },
      {
        en: "Pickled Tea Leaf Salad",
        my: "လက်ဖက်သုပ်",
        mmk: 3500,
        cat: "food",
        desc: "Laphet thoke with crunchy toppings",
      },
      { en: "Shan Noodles", my: "ရှမ်းခေါက်ဆွဲ", mmk: 3000, cat: "food", desc: "Shan noodle soup" },
      {
        en: "Green Tea 200g",
        my: "လက်ဖက်ခြောက်",
        mmk: 6500,
        cat: "food",
        desc: "Loose-leaf green tea",
      },
      {
        en: "Tea Leaf Snack Box",
        my: null,
        mmk: 4500,
        cat: "food",
        desc: "Assorted laphet snack box",
      },
    ],
  },
  {
    name: "Golden Valley Electronics",
    status: "ACTIVE",
    descEn: "Phones, accessories and gadgets",
    descMy: "ဖုန်းနှင့် အီလက်ထရောနစ်ပစ္စည်းများ",
    phone: "+95 9 666 777 888",
    products: [
      {
        en: "Phone Case",
        my: "ဖုန်းခွံ",
        mmk: 4000,
        cat: "electronics",
        desc: "Shockproof phone case",
      },
      {
        en: "Power Bank 10000mAh",
        my: "ပါဝါဘဏ်",
        mmk: 28000,
        cat: "electronics",
        desc: "Dual USB power bank",
      },
      {
        en: "Wireless Earbuds",
        my: "ဝါယာလက်စ်နားကြပ်",
        mmk: 45000,
        cat: "electronics",
        desc: "Bluetooth 5.3 earbuds",
      },
      {
        en: "Bluetooth Speaker",
        my: null,
        mmk: 38000,
        cat: "electronics",
        desc: "Portable waterproof speaker",
      },
      {
        en: "USB-C Cable 2m",
        my: null,
        mmk: 3500,
        cat: "electronics",
        desc: "Fast-charging braided cable",
      },
    ],
  },
  {
    name: "Thanaka Beauty",
    status: "DRAFT",
    descEn: "Natural thanaka-based skincare",
    descMy: "သနပ်ခါးအခြေခံ အလှကုန်များ",
    phone: "+95 9 777 888 999",
    products: [
      {
        en: "Thanaka Powder",
        my: "သနပ်ခါးမှုန့်",
        mmk: 2500,
        cat: "beauty",
        desc: "Pure thanaka powder",
        status: "DRAFT",
      },
      {
        en: "Thanaka Face Cream",
        my: null,
        mmk: 9000,
        cat: "beauty",
        desc: "Moisturizing face cream",
        status: "DRAFT",
      },
    ],
  },
  {
    name: "Ngapali Seafood",
    status: "SUSPENDED",
    descEn: "Dried and fresh seafood from the Rakhine coast",
    descMy: "ရခိုင်ကမ်းခြေမှ ပင်လယ်စာများ",
    phone: "+95 9 888 999 000",
    products: [
      {
        en: "Dried Fish 500g",
        my: "ငါးခြောက်",
        mmk: 8000,
        cat: "food",
        desc: "Sun-dried fish",
        status: "HIDDEN",
      },
      {
        en: "Shrimp Paste Jar",
        my: "ငံပြာရည်",
        mmk: 3000,
        cat: "food",
        desc: "Traditional ngapi",
        status: "HIDDEN",
      },
    ],
  },
] as const;

// One owner per shop (Shop.ownerUserId is @unique).
const owners: DbUser[] = [];
for (const [i, def] of shopDefs.entries()) {
  owners.push(
    await ensureUser({
      name: `${def.name} Owner`,
      email: `owner${i + 1}@example.com`,
      password: PASSWORD,
      role: "shop_owner",
    }),
  );
}

const customerNames = ["Aung Aung", "Thida Win", "Min Thu", "Su Su Hlaing", "Kyaw Zin"];
const customers: DbUser[] = [];
for (const [i, name] of customerNames.entries()) {
  customers.push(
    await ensureUser({
      name,
      // first one keeps the original email
      email: i === 0 ? "customer@example.com" : `customer${i + 1}@example.com`,
      password: PASSWORD,
      role: "customer",
    }),
  );
}
console.log(`✅ Users seeded (${1 + owners.length + customers.length})`);

// ---------------------------------------------------------------
// Categories
// ---------------------------------------------------------------
const categoryDefs = [
  { slug: "fashion", nameEn: "Fashion", nameMy: "ဖက်ရှင်" },
  { slug: "food", nameEn: "Food", nameMy: "အစားအစာ" },
  { slug: "electronics", nameEn: "Electronics", nameMy: "အီလက်ထရောနစ်" },
  { slug: "home", nameEn: "Home & Living", nameMy: "အိမ်သုံးပစ္စည်း" },
  { slug: "beauty", nameEn: "Beauty", nameMy: "အလှကုန်" },
  { slug: "crafts", nameEn: "Crafts", nameMy: "လက်မှုပစ္စည်း" },
];

const categoryIds = new Map<string, string>();
for (const [i, c] of categoryDefs.entries()) {
  const cat = await prisma.category.upsert({
    where: { slug: c.slug },
    update: { nameEn: c.nameEn, nameMy: c.nameMy, sortOrder: i, isActive: true },
    create: { ...c, sortOrder: i, isActive: true },
  });
  categoryIds.set(c.slug, cat.id);
}
console.log("✅ Categories seeded");

// ---------------------------------------------------------------
// Shops, products, assets, product images
// ---------------------------------------------------------------
type SeededProduct = {
  id: string;
  shopId: string;
  nameEn: string;
  nameMy: string | null;
  slug: string;
  priceMMK: number;
  status: string;
};

const shops: Shop[] = [];
const allProducts: SeededProduct[] = [];

for (const [i, def] of shopDefs.entries()) {
  const owner = at(owners, i);
  const slug = slugify(def.name);

  const shop = await prisma.shop.upsert({
    where: { slug },
    update: {},
    create: {
      ownerUserId: owner.id,
      name: def.name,
      slug,
      descriptionEn: def.descEn,
      descriptionMy: def.descMy,
      contactPhone: def.phone,
      socialLinks: { facebook: `https://facebook.com/${slug}`, viber: def.phone },
      status: def.status,
      ...(def.status === "ACTIVE" || def.status === "SUSPENDED"
        ? { reviewedAt: new Date(), reviewNote: "Approved (seed)" }
        : {}),
    },
  });
  shops.push(shop);

  for (const p of def.products) {
    const pSlug = slugify(p.en);
    const status = ("status" in p ? p.status : "PUBLISHED") as
      | "PUBLISHED"
      | "DRAFT"
      | "ARCHIVED"
      | "HIDDEN";

    const data = {
      categoryId: categoryIds.get(p.cat)!,
      nameEn: p.en,
      nameMy: p.my,
      descriptionEn: p.desc,
      priceMMK: p.mmk,
      priceTHB: p.mmk >= 10000 ? Math.round(p.mmk / 60) : null, // rough, just demo data
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      stockQuantity: status === "PUBLISHED" ? 50 : null,
      // Full slug keeps SKUs unique per shop (@@unique([shopId, sku])).
      sku: `${slug.slice(0, 3).toUpperCase()}-${pSlug.toUpperCase()}`,
    };

    const product = await prisma.product.upsert({
      where: { shopId_slug: { shopId: shop.id, slug: pSlug } },
      update: data,
      create: { shopId: shop.id, slug: pSlug, ...data },
    });

    allProducts.push({
      id: product.id,
      shopId: shop.id,
      nameEn: product.nameEn,
      nameMy: product.nameMy,
      slug: product.slug,
      priceMMK: product.priceMMK,
      status: product.status,
    });

    // Placeholder asset + image (files don't need to exist in storage).
    const asset = await prisma.asset.upsert({
      where: { bucket_key: { bucket: "mini-shop", key: `seed/${slug}/${pSlug}.jpg` } },
      update: {},
      create: {
        userId: owner.id,
        bucket: "mini-shop",
        key: `seed/${slug}/${pSlug}.jpg`,
        contentType: "image/jpeg",
        size: 102400,
      },
    });
    await prisma.productImage.upsert({
      where: { productId_assetId: { productId: product.id, assetId: asset.id } },
      update: {},
      create: { productId: product.id, assetId: asset.id, altText: p.en, sortOrder: 0 },
    });
  }
}
console.log(`✅ Shops (${shops.length}) and products (${allProducts.length}) seeded`);

// ---------------------------------------------------------------
// Customer addresses
// ---------------------------------------------------------------
const cities = [
  { region: "Yangon", city: "Sanchaung" },
  { region: "Yangon", city: "Hlaing" },
  { region: "Mandalay", city: "Chanayethazan" },
  { region: "Naypyidaw", city: "Zabuthiri" },
  { region: "Shan", city: "Taunggyi" },
];

const addresses: CustomerAddress[] = [];
for (const [i, c] of customers.entries()) {
  const loc = at(cities, i);
  const existing = await prisma.customerAddress.findFirst({
    where: { userId: c.id, isDefault: true },
  });
  addresses.push(
    existing ??
      (await prisma.customerAddress.create({
        data: {
          userId: c.id,
          label: "Home",
          recipientName: c.name,
          phone: `+95 9 100 000 0${i}${i}`,
          countryCode: "MM",
          region: loc.region,
          city: loc.city,
          addressLine1: `No. ${10 + i}, Main Road`,
          postalCode: `1${i}001`,
          deliveryInstructions: "Call before delivery",
          isDefault: true,
        },
      })),
  );
}
console.log("✅ Addresses seeded");

// ---------------------------------------------------------------
// Likes
// ---------------------------------------------------------------
const publishedProducts = allProducts.filter((p) => p.status === "PUBLISHED");
await prisma.productLike.createMany({
  data: customers.flatMap((c, ci) =>
    publishedProducts
      .filter((_, pi) => (pi + ci) % 3 === 0)
      .map((p) => ({ userId: c.id, productId: p.id })),
  ),
  skipDuplicates: true,
});
console.log("✅ Likes seeded");

// ---------------------------------------------------------------
// Cart (customer 1 — items from a single shop, per MVP rule)
// ---------------------------------------------------------------
const cart = await prisma.cart.upsert({
  where: { userId: at(customers, 0).id },
  update: {},
  create: { userId: at(customers, 0).id },
});
const cartShopProducts = publishedProducts.filter((p) => p.shopId === at(shops, 5).id).slice(0, 2);
await prisma.cartItem.createMany({
  data: cartShopProducts.map((p, i) => ({ cartId: cart.id, productId: p.id, quantity: i + 1 })),
  skipDuplicates: true,
});
console.log("✅ Cart seeded");

// ---------------------------------------------------------------
// Orders (+ reviews for delivered ones)
// ---------------------------------------------------------------
const activeShops = shops.filter((s) => s.status === "ACTIVE");
const statuses = ["DELIVERED", "SHIPPED", "PLACED", "CANCELLED", "CONFIRMED", "DELIVERED"] as const;

let orderCounter = 0;
for (const [ci, customer] of customers.entries()) {
  const addr = at(addresses, ci);

  // Each customer orders from 3 different active shops.
  for (let k = 0; k < 3; k++) {
    orderCounter++;
    const shop = at(activeShops, (ci + k) % activeShops.length);
    const status = at(statuses, (ci + k) % statuses.length);
    const orderNumber = `ORD-SEED-${String(orderCounter).padStart(4, "0")}`;

    if (await prisma.order.findUnique({ where: { orderNumber } })) continue;

    const shopProducts = publishedProducts.filter((p) => p.shopId === shop.id);
    const picked = shopProducts.slice(0, 1 + ((ci + k) % 3));
    const lines = picked.map((p, i) => {
      const quantity = 1 + ((ci + i) % 3);
      return { p, quantity, lineTotal: p.priceMMK * quantity };
    });
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const shippingFee = 2000;
    const now = new Date();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: customer.id,
        shopId: shop.id,
        status,
        paymentMethod: "COD",
        paymentStatus: status === "DELIVERED" ? "PAID" : "UNPAID",
        currency: "MMK",
        subtotalAmount: subtotal,
        shippingFee,
        discountAmount: 0,
        totalAmount: subtotal + shippingFee,
        recipientName: addr.recipientName,
        recipientPhone: addr.phone,
        shippingCountryCode: addr.countryCode,
        shippingRegion: addr.region,
        shippingCity: addr.city,
        shippingAddressLine1: addr.addressLine1,
        shippingPostalCode: addr.postalCode,
        deliveryInstructions: addr.deliveryInstructions,
        customerNote: k === 0 ? "Please pack carefully" : null,
        cancelReason: status === "CANCELLED" ? "Customer changed their mind" : null,
        confirmedAt: status !== "PLACED" ? now : null,
        shippedAt: status === "SHIPPED" || status === "DELIVERED" ? now : null,
        deliveredAt: status === "DELIVERED" ? now : null,
        cancelledAt: status === "CANCELLED" ? now : null,
        items: {
          create: lines.map((l) => ({
            productId: l.p.id,
            productNameEn: l.p.nameEn,
            productNameMy: l.p.nameMy,
            productSlug: l.p.slug,
            unitPrice: l.p.priceMMK,
            quantity: l.quantity,
            lineTotal: l.lineTotal,
          })),
        },
      },
    });

    if (order.status === "DELIVERED") {
      await prisma.productReview.createMany({
        data: lines.map((l, i) => ({
          userId: customer.id,
          productId: l.p.id,
          rating: 3 + ((ci + i) % 3), // 3–5
          comment: at(
            ["Great quality!", "Fast delivery, as described.", "Nice, would buy again."],
            (ci + i) % 3,
          ),
          status: "APPROVED" as const,
        })),
        skipDuplicates: true,
      });
    }
  }
}
console.log(`✅ Orders seeded (${orderCounter})`);

console.log("🌱 Seed finished");
