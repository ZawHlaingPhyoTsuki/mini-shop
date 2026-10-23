import { createFileRoute, redirect } from "@tanstack/react-router";

import ShopReviewList from "@/features/shops/components/shop-review-list";
import { listShopsForReview } from "@/features/shops/server";
import { isAdmin } from "@/lib/authz";

export const Route = createFileRoute("/_auth/admin/shops")({
  beforeLoad: ({ context }) => {
    if (!context.session || !isAdmin(context.session.user)) {
      throw redirect({ to: "/dashboard" });
    }
  },
  loader: async () => ({ shops: await listShopsForReview() }),
  component: AdminShopsPage,
});

function AdminShopsPage() {
  const { shops } = Route.useLoaderData();

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-2">
      <div>
        <h1>Shop review</h1>
        <p className="text-muted-foreground">Approve or reject merchant shop requests.</p>
      </div>

      <ShopReviewList shops={shops} />
    </div>
  );
}
