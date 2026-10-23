import { productsTransport } from "@/features/products/products-transport";
import { shopsTransport } from "@/features/shops/shops-transport";
import { categoriesTransport } from "@/features/categories/categories-transport";
import { MerchantProductsList } from "@/features/products/merchant/components/merchant-products-list";
import type { Product } from "@/features/products/types/product";
import type { Category } from "@/features/categories/types/category";

export const dynamic = "force-dynamic";

export default async function DashboardProductsPage() {
  const shop = await shopsTransport.getMyShop();

  let products: Product[] = [];
  let categories: Category[] = [];

  if (shop) {
    try {
      products = await productsTransport.getMerchantProducts();
    } catch {
      products = [];
    }
  }

  try {
    categories = await categoriesTransport.getCategories();
  } catch {
    categories = [];
  }

  return (
    <div className="container mx-auto max-w-5xl">
      <MerchantProductsList initialProducts={products} shop={shop} categories={categories} />
    </div>
  );
}
