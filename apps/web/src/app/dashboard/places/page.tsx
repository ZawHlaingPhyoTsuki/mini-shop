import { Suspense } from "react";

import { areasTransport } from "@/features/areas/areas-transport";
import { categoriesTransport } from "@/features/categories/categories-transport";
import { AdminPlaces, AdminPlacesSkeleton } from "@/features/places/admin/components/admin-places";
import { placesTransport } from "@/features/places/places-transport";

async function AdminPlacesContent() {
  const [places, categories, areas] = await Promise.all([
    placesTransport.getAdminPlaces(""),
    categoriesTransport.getCategories(),
    areasTransport.getAreas(),
  ]);
  return <AdminPlaces initialPlaces={places} categories={categories} areas={areas} />;
}

export default function AdminPlacesPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-6">
      <Suspense fallback={<AdminPlacesSkeleton />}>
        <AdminPlacesContent />
      </Suspense>
    </main>
  );
}
