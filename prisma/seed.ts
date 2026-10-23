import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/services";

type Role = "admin" | "shop_owner" | "customer";

console.time("seed");

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
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

function must<K, V>(map: Map<K, V>, key: K): V {
  const v = map.get(key);
  if (v === undefined) throw new Error(`Seed lookup failed for ${String(key)}`);
  return v;
}

const PASSWORD = "password123";

// ---------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------
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

const customerNames = ["Aung Aung", "Thida Win", "Min Thu", "Su Su Hlaing", "Kyaw Zin"];

const categoryDefs = [
  { slug: "fashion", nameEn: "Fashion", nameMy: "ဖက်ရှင်" },
  { slug: "food", nameEn: "Food", nameMy: "အစားအစာ" },
  { slug: "electronics", nameEn: "Electronics", nameMy: "အီလက်ထရောနစ်" },
  { slug: "home", nameEn: "Home & Living", nameMy: "အိမ်သုံးပစ္စည်း" },
  { slug: "beauty", nameEn: "Beauty", nameMy: "အလှကုန်" },
  { slug: "crafts", nameEn: "Crafts", nameMy: "လက်မှုပစ္စည်း" },
];

const cities = [
  { region: "Yangon", city: "Sanchaung" },
  { region: "Yangon", city: "Hlaing" },
  { region: "Mandalay", city: "Chanayethazan" },
  { region: "Naypyidaw", city: "Zabuthiri" },
  { region: "Shan", city: "Taunggyi" },
];

const ownerEmails = shopDefs.map((_, i) => `owner${i + 1}@example.com`);
const customerEmails = customerNames.map((_, i) =>
  i === 0 ? "customer@example.com" : `customer${i + 1}@example.com`,
);

const userDefs = [
  { name: "Admin User", email: "admin@example.com", role: "admin" as Role },
  ...shopDefs.map((d, i) => ({
    name: `${d.name} Owner`,
    email: at(ownerEmails, i),
    role: "shop_owner" as Role,
  })),
  ...customerNames.map((name, i) => ({
    name,
    email: at(customerEmails, i),
    role: "customer" as Role,
  })),
];

// ---------------------------------------------------------------
// Users
// Hash the password ONCE and insert users + credential accounts in
// bulk (same result as signUpEmail, without N slow hashes/queries).
// ---------------------------------------------------------------
const authCtx = await auth.$context;
const passwordHash = await authCtx.password.hash(PASSWORD);

await prisma.user.createMany({
  data: userDefs.map((u) => ({
    id: randomUUID(),
    name: u.name,
    email: u.email,
    role: u.role,
    emailVerified: true,
  })),
  skipDuplicates: true,
});

const users = await prisma.user.findMany({
  where: { email: { in: userDefs.map((u) => u.email) } },
});
const userByEmail = new Map(users.map((u) => [u.email, u]));

const usersWithAccount = new Set(
  (
    await prisma.account.findMany({
      where: { userId: { in: users.map((u) => u.id) }, providerId: "credential" },
      select: { userId: true },
    })
  ).map((a) => a.userId),
);

await prisma.account.createMany({
  data: users
    .filter((u) => !usersWithAccount.has(u.id))
    .map((u) => ({
      id: randomUUID(),
      userId: u.id,
      accountId: u.id,
      providerId: "credential",
      password: passwordHash,
    })),
  skipDuplicates: true,
});

// Make sure roles/verification are right for pre-existing users too.
await Promise.all(
  (["admin", "shop_owner", "customer"] as const).map((role) =>
    prisma.user.updateMany({
      where: { email: { in: userDefs.filter((u) => u.role === role).map((u) => u.email) } },
      data: { role, emailVerified: true },
    }),
  ),
);

const owners = ownerEmails.map((e) => must(userByEmail, e));
const customers = customerEmails.map((e) => must(userByEmail, e));
console.log(`✅ Users seeded (${users.length})`);

// ---------------------------------------------------------------
// Categories
// ---------------------------------------------------------------
await prisma.category.createMany({
  data: categoryDefs.map((c, i) => ({ ...c, sortOrder: i, isActive: true })),
  skipDuplicates: true,
});
const categoryIds = new Map(
  (
    await prisma.category.findMany({ where: { slug: { in: categoryDefs.map((c) => c.slug) } } })
  ).map((c) => [c.slug, c.id]),
);
console.log("✅ Categories seeded");

// ---------------------------------------------------------------
// Shops
// ---------------------------------------------------------------
await prisma.shop.createMany({
  data: shopDefs.map((def, i) => {
    const slug = slugify(def.name);
    const reviewed = def.status === "ACTIVE" || def.status === "SUSPENDED";
    return {
      ownerUserId: at(owners, i).id,
      name: def.name,
      slug,
      descriptionEn: def.descEn,
      descriptionMy: def.descMy,
      contactPhone: def.phone,
      socialLinks: { facebook: `https://facebook.com/${slug}`, viber: def.phone },
      status: def.status,
      reviewedAt: reviewed ? new Date() : null,
      reviewNote: reviewed ? "Approved (seed)" : null,
    };
  }),
  skipDuplicates: true,
});

const shopBySlug = new Map(
  (
    await prisma.shop.findMany({ where: { slug: { in: shopDefs.map((d) => slugify(d.name)) } } })
  ).map((s) => [s.slug, s]),
);
const shops = shopDefs.map((d) => must(shopBySlug, slugify(d.name))); // same order as shopDefs
const shopById = new Map(shops.map((s) => [s.id, s]));

// ---------------------------------------------------------------
// Products
// ---------------------------------------------------------------
await prisma.product.createMany({
  data: shopDefs.flatMap((def) => {
    const shop = must(shopBySlug, slugify(def.name));
    return def.products.map((p) => {
      const pSlug = slugify(p.en);
      const status = ("status" in p ? p.status : "PUBLISHED") as
        | "PUBLISHED"
        | "DRAFT"
        | "ARCHIVED"
        | "HIDDEN";
      return {
        shopId: shop.id,
        categoryId: must(categoryIds, p.cat),
        nameEn: p.en,
        nameMy: p.my,
        descriptionEn: p.desc,
        slug: pSlug,
        priceMMK: p.mmk,
        priceTHB: p.mmk >= 10000 ? Math.round(p.mmk / 60) : null, // rough, demo data
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        stockQuantity: status === "PUBLISHED" ? 50 : null,
        sku: `${shop.slug.slice(0, 3).toUpperCase()}-${pSlug.toUpperCase()}`,
      };
    });
  }),
  skipDuplicates: true,
});

const allProducts = await prisma.product.findMany({
  where: { shopId: { in: shops.map((s) => s.id) } },
});
const publishedProducts = allProducts.filter((p) => p.status === "PUBLISHED");
console.log(`✅ Shops (${shops.length}) and products (${allProducts.length}) seeded`);

// ---------------------------------------------------------------
// Assets + product images (placeholder keys; files needn't exist)
// ---------------------------------------------------------------
const assetKey = (shopSlug: string, productSlug: string) => `seed/${shopSlug}/${productSlug}.jpg`;
const BUCKET = "mini-shop";

await prisma.asset.createMany({
  data: allProducts.map((p) => {
    const shop = must(shopById, p.shopId);
    return {
      userId: shop.ownerUserId,
      bucket: BUCKET,
      key: assetKey(shop.slug, p.slug),
      contentType: "image/jpeg",
      size: 102400,
    };
  }),
  skipDuplicates: true,
});

const assetByKey = new Map(
  (
    await prisma.asset.findMany({
      where: {
        bucket: BUCKET,
        key: { in: allProducts.map((p) => assetKey(must(shopById, p.shopId).slug, p.slug)) },
      },
    })
  ).map((a) => [a.key, a]),
);

await prisma.productImage.createMany({
  data: allProducts.map((p) => ({
    productId: p.id,
    assetId: must(assetByKey, assetKey(must(shopById, p.shopId).slug, p.slug)).id,
    altText: p.nameEn,
    sortOrder: 0,
  })),
  skipDuplicates: true,
});
console.log("✅ Assets & images seeded");

// ---------------------------------------------------------------
// Customer addresses (default address per customer)
// ---------------------------------------------------------------
const customerIds = customers.map((c) => c.id);
const existingDefaults = new Set(
  (
    await prisma.customerAddress.findMany({
      where: { userId: { in: customerIds }, isDefault: true },
      select: { userId: true },
    })
  ).map((a) => a.userId),
);

await prisma.customerAddress.createMany({
  data: customers.flatMap((c, i) => {
    if (existingDefaults.has(c.id)) return [];
    const loc = at(cities, i);
    return [
      {
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
    ];
  }),
});

const addressByUser = new Map(
  (
    await prisma.customerAddress.findMany({
      where: { userId: { in: customerIds }, isDefault: true },
    })
  ).map((a) => [a.userId, a]),
);
console.log("✅ Addresses seeded");

// ---------------------------------------------------------------
// Likes
// ---------------------------------------------------------------
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
const cartShopId = at(shops, 5).id;
await prisma.cartItem.createMany({
  data: publishedProducts
    .filter((p) => p.shopId === cartShopId)
    .slice(0, 2)
    .map((p, i) => ({ cartId: cart.id, productId: p.id, quantity: i + 1 })),
  skipDuplicates: true,
});
console.log("✅ Cart seeded");

// ---------------------------------------------------------------
// Orders, order items, reviews — 3 bulk inserts total
// ---------------------------------------------------------------
const activeShops = shops.filter((s) => s.status === "ACTIVE");
const statuses = ["DELIVERED", "SHIPPED", "PLACED", "CANCELLED", "CONFIRMED", "DELIVERED"] as const;
const reviewComments = ["Great quality!", "Fast delivery, as described.", "Nice, would buy again."];

const existingOrderNumbers = new Set(
  (
    await prisma.order.findMany({
      where: { orderNumber: { startsWith: "ORD-SEED-" } },
      select: { orderNumber: true },
    })
  ).map((o) => o.orderNumber),
);

const built = customers
  .flatMap((customer, ci) =>
    [0, 1, 2].map((k) => ({
      customer,
      ci,
      k,
      orderNumber: `ORD-SEED-${String(ci * 3 + k + 1).padStart(4, "0")}`,
    })),
  )
  .filter((plan) => !existingOrderNumbers.has(plan.orderNumber))
  .map(({ customer, ci, k, orderNumber }) => {
    const addr = must(addressByUser, customer.id);
    const shop = at(activeShops, (ci + k) % activeShops.length);
    const status = at(statuses, (ci + k) % statuses.length);

    const picked = publishedProducts
      .filter((p) => p.shopId === shop.id)
      .slice(0, 1 + ((ci + k) % 3));
    const lines = picked.map((p, i) => {
      const quantity = 1 + ((ci + i) % 3);
      return { p, quantity, lineTotal: p.priceMMK * quantity };
    });
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const shippingFee = 2000;
    const now = new Date();
    const id = randomUUID();

    return {
      order: {
        id,
        orderNumber,
        userId: customer.id,
        shopId: shop.id,
        status,
        paymentMethod: "COD" as const,
        paymentStatus: (status === "DELIVERED" ? "PAID" : "UNPAID") as "PAID" | "UNPAID",
        currency: "MMK" as const,
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
      },
      items: lines.map((l) => ({
        orderId: id,
        productId: l.p.id,
        productNameEn: l.p.nameEn,
        productNameMy: l.p.nameMy,
        productSlug: l.p.slug,
        unitPrice: l.p.priceMMK,
        quantity: l.quantity,
        lineTotal: l.lineTotal,
      })),
      reviews:
        status === "DELIVERED"
          ? lines.map((l, i) => ({
              userId: customer.id,
              productId: l.p.id,
              rating: 3 + ((ci + i) % 3), // 3–5
              comment: at(reviewComments, (ci + i) % reviewComments.length),
              status: "APPROVED" as const,
            }))
          : [],
    };
  });

await prisma.order.createMany({ data: built.map((b) => b.order) });
await prisma.orderItem.createMany({ data: built.flatMap((b) => b.items) });
await prisma.productReview.createMany({
  data: built.flatMap((b) => b.reviews),
  skipDuplicates: true,
});
console.log(`✅ Orders seeded (${built.length} new)`);

console.timeEnd("seed");
console.log("🌱 Seed finished");
