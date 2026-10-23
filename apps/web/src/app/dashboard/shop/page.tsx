import { shopsTransport } from "@/features/shops/shops-transport";
import { MerchantShopView } from "@/features/shops/components/merchant-shop-view";

export const dynamic = "force-dynamic";

export default async function DashboardShopPage() {
  const shop = await shopsTransport.getMyShop();

  return (
    <div className="container mx-auto max-w-4xl">
      <MerchantShopView initialShop={shop} />
    </div>
  );
}
