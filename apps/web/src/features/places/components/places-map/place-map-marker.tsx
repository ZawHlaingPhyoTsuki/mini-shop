"use client";

import { MapPin } from "lucide-react";

import { MapMarker, MarkerContent, MarkerLabel } from "@/components/ui/map";
import { cn } from "cn";
import { useDictionary } from "@/i18n/dictionary-provider";

export function PlaceMapMarker({
  longitude,
  latitude,
  name,
  selected,
  onSelect,
}: {
  longitude: number;
  latitude: number;
  name: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const t = useDictionary();
  return (
    <MapMarker longitude={longitude} latitude={latitude} onClick={onSelect}>
      <MarkerContent
        className={cn("flex min-h-11 min-w-11 items-center justify-center", selected && "z-10")}
      >
        {selected ? (
          <span className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-primary shadow-lg ring-4 ring-primary/30">
            <MapPin className="size-4 text-primary-foreground" aria-hidden />
          </span>
        ) : (
          <span
            className="block size-4 rounded-full border-2 border-white bg-primary shadow-md transition-transform hover:scale-125"
            aria-label={t.marker.select(name)}
          />
        )}
        <MarkerLabel position="bottom" className={cn(selected && "font-semibold")}>
          {name}
        </MarkerLabel>
      </MarkerContent>
    </MapMarker>
  );
}
