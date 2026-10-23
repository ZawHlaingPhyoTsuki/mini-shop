import { getDictionary } from "@/i18n/get-dictionary";
import { productsTransport } from "@/features/products/products-transport";
import { categoriesTransport } from "@/features/categories/categories-transport";
import { MarketplaceCatalog } from "@/features/products/public/components/marketplace-catalog";
import type { Product } from "@/features/products/types/product";
import type { Category } from "@/features/categories/types/category";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getDictionary();
  return {
    title: t.landing.metaTitle,
    description: t.landing.metaDescription,
  };
}

export default async function HomePage() {
  const t = await getDictionary();

  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    const [fetchedProducts, fetchedCategories] = await Promise.all([
      productsTransport.getPublicProducts(),
      categoriesTransport.getCategories(),
    ]);
    products = fetchedProducts;
    categories = fetchedCategories;
  } catch (err) {
    console.error("Failed to fetch public marketplace products:", err);
  }

  return (
    <div className="container mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Hero Headline */}
      <div className="text-center max-w-2xl mx-auto space-y-2 pt-2 sm:pt-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          {t.landing.title}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {t.landing.subtitle}
        </p>
      </div>

      {/* Catalog & Search */}
      <MarketplaceCatalog initialProducts={products} categories={categories} />
    </div>
  );
}
