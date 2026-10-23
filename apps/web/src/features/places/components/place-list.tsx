"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useDictionary } from "@/i18n/dictionary-provider";

import type { Place } from "../types/place";
import { PlaceListItem } from "./place-list-item";

export function PlaceList({
  places,
  selectedPlaceId,
  onSelect,
}: {
  places: Place[];
  selectedPlaceId: string | null;
  onSelect: (id: string) => void;
}) {
  const t = useDictionary();
  if (places.length === 0) {
    return <p className="text-muted-foreground p-1 text-sm">{t.list.empty}</p>;
  }
  return (
    <div className="grid gap-2" role="list">
      {places.map((place) => (
        <PlaceListItem
          key={place.id}
          place={place}
          active={place.id === selectedPlaceId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export function PlaceListSkeleton() {
  const t = useDictionary();
  return (
    <div className="grid gap-2" aria-busy="true" aria-label={t.list.loading}>
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex gap-3 rounded-lg border p-3">
          <Skeleton className="size-20 shrink-0 rounded-md" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
