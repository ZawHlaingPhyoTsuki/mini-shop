"use client";

import { useEffect, useMemo, useRef } from "react";

import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  useMap,
  type MapRef,
} from "@/components/ui/map";
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { useLocale } from "@/i18n/dictionary-provider";
import { displayName } from "@/i18n/display-name";

import type { Place } from "../../types/place";
import { PlaceMapMarker } from "./place-map-marker";
import { PlaceMapPopup } from "./place-map-popup";
import {
  isLocatedPlace,
  useMapCamera,
  type Located,
  type PlacesMapViewport,
} from "../../hooks/use-map-camera";

export type { PlacesMapViewport };

const TACHILEIK: [number, number] = [99.882, 20.447];

export type PlacesMapEditable = {
  latitude?: number;
  longitude?: number;
  onPick: (latitude: number, longitude: number) => void;
};

function MapClickHandler({ onPick }: { onPick: (latitude: number, longitude: number) => void }) {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;
    const handleClick = (event: { lngLat: { lng: number; lat: number } }) => {
      onPick(event.lngLat.lat, event.lngLat.lng);
    };
    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, onPick]);

  return null;
}

export function PlacesMap({
  places,
  selectedPlaceId = null,
  onSelect,
  includeInactive = false,
  editable,
  viewport,
}: {
  places: Place[];
  selectedPlaceId?: string | null;
  onSelect?: (id: string | null) => void;
  includeInactive?: boolean;
  editable?: PlacesMapEditable;
  viewport?: PlacesMapViewport;
}) {
  const mapRef = useRef<MapRef | null>(null);
  const locale = useLocale();
  const isDesktop = useMediaQuery(DESKTOP_QUERY, true);

  const mappedPlaces = useMemo(
    () =>
      places.filter(
        (place): place is Located => (includeInactive || place.isActive) && isLocatedPlace(place),
      ),
    [includeInactive, places],
  );
  const selected =
    selectedPlaceId != null ? (mappedPlaces.find((p) => p.id === selectedPlaceId) ?? null) : null;

  const draft =
    editable?.latitude !== undefined && editable?.longitude !== undefined
      ? { latitude: editable.latitude, longitude: editable.longitude }
      : null;
  const center: [number, number] = draft ? [draft.longitude, draft.latitude] : TACHILEIK;

  useMapCamera({
    mapRef,
    places: mappedPlaces,
    selected,
    fitResults: !editable,
    viewport,
    isDesktop,
  });

  return (
    <Map
      ref={mapRef}
      className="absolute inset-0"
      center={center}
      zoom={draft ? 15 : 13}
      styles={{
        light: "https://tiles.openfreemap.org/styles/bright",
        // dark: "https://tiles.openfreemap.org/styles/dark", // intentionally not used, as it is too dark for our map pins to be visible
      }}
    >
      {/* Hidden on phones (pinch-zoom works), but the admin picker keeps them. */}
      {isDesktop || editable ? <MapControls position="top-right" showLocate={false} /> : null}
      {editable ? (
        <>
          <MapClickHandler onPick={editable.onPick} />
          {draft ? (
            <MapMarker
              longitude={draft.longitude}
              latitude={draft.latitude}
              draggable
              onDragEnd={({ lng, lat }) => editable.onPick(lat, lng)}
            >
              <MarkerContent />
            </MapMarker>
          ) : null}
        </>
      ) : null}
      {mappedPlaces.map((place) => (
        <PlaceMapMarker
          key={place.id}
          longitude={place.longitude}
          latitude={place.latitude}
          name={displayName(place.nameMy, place.nameEn, locale) || place.id}
          selected={place.id === selectedPlaceId}
          onSelect={() => onSelect?.(place.id === selectedPlaceId ? null : place.id)}
        />
      ))}
      {selected ? <PlaceMapPopup place={selected} onClose={() => onSelect?.(null)} /> : null}
    </Map>
  );
}

export function PlacesMapSkeleton() {
  return (
    <div
      className="h-[min(62vh,30rem)] min-h-72 animate-pulse border bg-muted/30 md:h-full"
      aria-busy="true"
    />
  );
}
