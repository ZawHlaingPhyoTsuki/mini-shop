import { Suspense } from "react";

import {
  AdminCategories,
  AdminCategoriesSkeleton,
} from "@/features/categories/admin/components/admin-categories";
import { categoriesTransport } from "@/features/categories/categories-transport";

async function AdminCategoriesContent() {
  const categories = await categoriesTransport.getAdminCategories();
  return <AdminCategories initialCategories={categories} />;
}

export default function AdminCategoriesPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-6">
      <Suspense fallback={<AdminCategoriesSkeleton />}>
        <AdminCategoriesContent />
      </Suspense>
    </main>
  );
}
