import { Suspense } from "react";

import {
  AdminDashboard,
  AdminDashboardSkeleton,
} from "@/features/places/admin/components/admin-dashboard";

export default function Page() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <Suspense fallback={<AdminDashboardSkeleton />}>
        <AdminDashboard />
      </Suspense>
    </main>
  );
}
