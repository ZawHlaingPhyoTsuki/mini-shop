import { createFileRoute } from "@tanstack/react-router";

import ShopForm from "@/features/shops/components/shop-form";
import ShopStatusCard from "@/features/shops/components/shop-status-card";
import { getMyShop } from "@/features/shops/server";

export const Route = createFileRoute("/_auth/dashboard/shop")({
  loader: async () => ({ shop: await getMyShop() }),
  component: MyShopPage,
});

function MyShopPage() {
  const { shop } = Route.useLoaderData();

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-2">
      <div>
        <h1>{shop ? "Your shop" : "Create a shop"}</h1>
        <p className="text-muted-foreground">
          Customers and merchants use the same account. {shop ? null : "Register your shop here."}
        </p>
      </div>

      {shop ? <ShopStatusCard shop={shop} /> : null}

      {!shop || shop.status === "DRAFT" || shop.status === "PENDING_REVIEW" ? (
        <ShopForm shop={shop} />
      ) : null}
    </div>
  );
}
