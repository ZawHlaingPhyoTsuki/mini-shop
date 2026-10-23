"use client";

import { Button } from "@/components/ui/button";
import { useDictionary } from "@/i18n/dictionary-provider";

import { PlacesMap } from "../../components/places-map/places-map";

export function PlaceLocationPicker({
  latitude,
  longitude,
  onChange,
}: {
  latitude?: number;
  longitude?: number;
  onChange: (latitude?: number, longitude?: number) => void;
}) {
  const hasLocation = latitude !== undefined && longitude !== undefined;
  const t = useDictionary();

  return (
    <div className="grid gap-3">
      <div className="relative h-64 overflow-hidden border">
        <PlacesMap
          places={[]}
          editable={{
            latitude,
            longitude,
            onPick: (lat, lng) => onChange(lat, lng),
          }}
        />
      </div>
      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <p>
          {t.locationPicker.latitude}
          {hasLocation ? latitude.toFixed(6) : t.locationPicker.notSet}
        </p>
        <p>
          {t.locationPicker.longitude}
          {hasLocation ? longitude.toFixed(6) : t.locationPicker.notSet}
        </p>
      </div>
      {hasLocation ? (
        <Button type="button" variant="outline" onClick={() => onChange(undefined, undefined)}>
          {t.locationPicker.clear}
        </Button>
      ) : null}
    </div>
  );
}
