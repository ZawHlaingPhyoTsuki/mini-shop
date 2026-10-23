import type { Metadata } from "next";
import { Suspense } from "react";

import { categoriesTransport } from "@/features/categories/categories-transport";
import { PlacesExplorer } from "@/features/places/components/places-explorer";
import { PlacesMapSkeleton } from "@/features/places/components/places-map/places-map";
import { PlaceListSkeleton } from "@/features/places/components/place-list";
import { getPlaces } from "@/features/places/places-queries";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.mapPage.metaTitle, description: t.mapPage.metaDescription };
}

export default async function MapPage({ searchParams }: PageProps<"/map">) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const search = typeof sp.search === "string" ? sp.search : undefined;

  // Single fetch: map, list, popup, and sheet all derive from this Place[].
  const [places, categories] = await Promise.all([
    getPlaces({ category, search }),
    categoriesTransport.getCategories(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="grid gap-2 p-4">
          <PlaceListSkeleton />
          <PlacesMapSkeleton />
        </div>
      }
    >
      <PlacesExplorer places={places} categories={categories} />
    </Suspense>
  );
}
