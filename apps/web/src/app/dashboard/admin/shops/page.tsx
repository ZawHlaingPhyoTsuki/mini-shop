import { redirect } from "next/navigation";

import { getServerSession } from "@/features/auth/admin-session";
import { shopsTransport } from "@/features/shops/shops-transport";
import { AdminShopsQueue } from "@/features/shops/admin/components/admin-shops-queue";
import type { AdminShop } from "@/features/shops/types/shop";

export const dynamic = "force-dynamic";

export default async function AdminShopsPage() {
  const session = await getServerSession();
  if (session?.user.role !== "admin") {
    redirect("/dashboard");
  }

  let shops: AdminShop[] = [];
  try {
    shops = await shopsTransport.getAdminShops();
  } catch {
    shops = [];
  }

  return (
    <div className="container mx-auto max-w-5xl">
      <AdminShopsQueue initialShops={shops} />
    </div>
  );
}
