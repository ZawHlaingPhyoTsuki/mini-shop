"use client";

import { useState } from "react";

import { PlacesMap } from "../../components/places-map/places-map";
import type { Place } from "../../types/place";

export function AdminPlacesMap({ places }: { places: Place[] }) {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  return (
    <div className="relative h-96 overflow-hidden border">
      <PlacesMap
        places={places}
        includeInactive
        selectedPlaceId={selectedPlaceId}
        onSelect={setSelectedPlaceId}
      />
    </div>
  );
}
