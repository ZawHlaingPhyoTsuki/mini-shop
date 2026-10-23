import { Link, createFileRoute } from "@tanstack/react-router";

import AvatarCard from "@/components/avatar-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyAsset } from "@/functions/get-my-asset";
import { getMyShop } from "@/features/shops/server";
import { isAdmin } from "@/lib/authz";

export const Route = createFileRoute("/_auth/dashboard/")({
  loader: async () => {
    const [asset, shop] = await Promise.all([getMyAsset(), getMyShop()]);
    return { asset, shop };
  },
  component: DashboardOverview,
});

const STATUS_LABELS = {
  DRAFT: "Needs your attention",
  PENDING_REVIEW: "Waiting for approval",
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  CLOSED: "Closed",
} as const;

function DashboardOverview() {
  const { session } = Route.useRouteContext();
  const { asset, shop } = Route.useLoaderData();

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-2">
      <div>
        <h1>Dashboard</h1>
        <p>Welcome {session?.user.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your shop</CardTitle>
          <CardDescription>
            {shop
              ? `${shop.name} — ${STATUS_LABELS[shop.status]}`
              : "Create a shop to start selling on Mini Shop."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link to="/dashboard/shop">
            <Button>{shop ? "Manage shop" : "Create shop"}</Button>
          </Link>
          {session && isAdmin(session.user) ? (
            <Link to="/admin/shops">
              <Button variant="outline">Review shop requests</Button>
            </Link>
          ) : null}
        </CardContent>
      </Card>

      <AvatarCard asset={asset} />
    </div>
  );
}
