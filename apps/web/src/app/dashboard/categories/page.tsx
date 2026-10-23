import { Suspense } from "react";
import { redirect } from "next/navigation";

import {
  AdminCategories,
  AdminCategoriesSkeleton,
} from "@/features/categories/admin/components/admin-categories";
import { categoriesTransport } from "@/features/categories/categories-transport";
import { getServerSession } from "@/features/auth/admin-session";

export const dynamic = "force-dynamic";

async function AdminCategoriesContent() {
  const categories = await categoriesTransport.getAdminCategories();
  return <AdminCategories initialCategories={categories} />;
}

export default async function AdminCategoriesPage() {
  const session = await getServerSession();
  if (session?.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-6">
      <Suspense fallback={<AdminCategoriesSkeleton />}>
        <AdminCategoriesContent />
      </Suspense>
    </main>
  );
}
