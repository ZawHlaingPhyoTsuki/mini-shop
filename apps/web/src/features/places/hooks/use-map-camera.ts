"use client";

import { useEffect, type RefObject } from "react";

import type { MapRef } from "@/components/ui/map";
import type { Place } from "../types/place";

const SIDEBAR_PX = 400; // desktop side drawer width
const POPUP_ROOM_PX = 290; // space reserved above a selected marker for its popup (mobile)
const FIT_MARGIN_PX = 80; // breathing room around fitted results

// Tells the map how much of the screen the drawers cover.
export type PlacesMapViewport = {
  sidebarOpen: boolean; // desktop: is the side drawer open?
  drawerRatio: number; // mobile: fraction of screen height the bottom drawer covers (0 to 1)
};

type Padding = { top: number; right: number; bottom: number; left: number };

// Pure: easy to reason about and to test. Areas covered by drawers count as "not visible".
function computePadding(
  viewport: PlacesMapViewport | undefined,
  isDesktop: boolean,
  reservePopupRoom: boolean,
): Padding {
  if (!viewport) return { top: 0, right: 0, bottom: 0, left: 0 };
  if (isDesktop)
    return { top: 0, right: 0, bottom: 0, left: viewport.sidebarOpen ? SIDEBAR_PX : 0 };
  return {
    right: 0,
    top: reservePopupRoom ? POPUP_ROOM_PX : 0,
    bottom: Math.round(window.innerHeight * viewport.drawerRatio),
    left: 0,
  };
}

export type Located = Place & { latitude: number; longitude: number };

export function isLocatedPlace(place: Place): place is Located {
  return place.latitude !== null && place.longitude !== null;
}

export function useMapCamera({
  mapRef,
  places,
  selected,
  fitResults,
  viewport,
  isDesktop,
}: {
  mapRef: RefObject<MapRef | null>;
  places: Located[];
  selected: Located | null;
  fitResults: boolean; // false for the admin picker, which manages its own view
  viewport?: PlacesMapViewport;
  isDesktop: boolean;
}) {
  const selectedId = selected?.id;
  const selectedLng = selected?.longitude;
  const selectedLat = selected?.latitude;
  const sidebarOpen = viewport?.sidebarOpen ?? false;
  const drawerRatio = viewport?.drawerRatio ?? 0;

  // Selection: fly to the chosen place, clear of the drawers and popup.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || selectedLng === undefined || selectedLat === undefined) return;
    map.flyTo({
      center: [selectedLng, selectedLat],
      zoom: Math.max(map.getZoom(), 15),
      padding: computePadding(viewport, isDesktop, true),
      duration: 600,
    });
  }, [mapRef, selectedId, selectedLng, selectedLat, sidebarOpen, drawerRatio, isDesktop]);

  // Results: when search/category changes, zoom to fit every matching pin.
  // Skipped while a place is selected so a refetch doesn't yank the view away.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !fitResults || selectedId !== undefined || places.length === 0) return;

    const lngs = places.map((p) => p.longitude);
    const lats = places.map((p) => p.latitude);
    const pad = computePadding(viewport, isDesktop, false);
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      {
        padding: {
          top: pad.top + FIT_MARGIN_PX,
          right: pad.right + FIT_MARGIN_PX,
          bottom: pad.bottom + FIT_MARGIN_PX,
          left: pad.left + FIT_MARGIN_PX,
        },
        maxZoom: 16,
        duration: 600,
      },
    );
  }, [mapRef, places, fitResults, selectedId, sidebarOpen, drawerRatio, isDesktop]);
}
