import { Suspense } from "react";

import { AdminAreas, AdminAreasSkeleton } from "@/features/areas/admin/components/admin-areas";
import { areasTransport } from "@/features/areas/areas-transport";

async function AdminAreasContent() {
  const areas = await areasTransport.getAdminAreas();
  return <AdminAreas initialAreas={areas} />;
}

export default function AdminAreasPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-6">
      <Suspense fallback={<AdminAreasSkeleton />}>
        <AdminAreasContent />
      </Suspense>
    </main>
  );
}
