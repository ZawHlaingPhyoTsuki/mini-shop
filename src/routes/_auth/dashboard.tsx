import { createFileRoute } from "@tanstack/react-router";

import AvatarCard from "@/components/avatar-card";
import { getMyAsset } from "@/functions/get-my-asset";

export const Route = createFileRoute("/_auth/dashboard")({
  loader: async () => {
    return { asset: await getMyAsset() };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { asset } = Route.useLoaderData();

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-2">
      <div>
        <h1>Dashboard</h1>
        <p>Welcome {session?.user.name}</p>
      </div>

      <AvatarCard asset={asset} />
    </div>
  );
}
