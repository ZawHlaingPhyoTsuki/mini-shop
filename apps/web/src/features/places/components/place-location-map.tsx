"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";

import { Map, MapMarker, MarkerContent } from "@/components/ui/map";
import { useDictionary } from "@/i18n/dictionary-provider";

import type { Place } from "../types/place";

// Mounts the map only once it is near the viewport.
function useNearViewport<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [near]);

  return [ref, near] as const;
}

export function PlaceLocationMap({ place }: { place: Place }) {
  const t = useDictionary();
  const [ref, near] = useNearViewport<HTMLElement>();

  if (place.latitude === null || place.longitude === null) return null;

  return (
    <section
      ref={ref}
      aria-label={t.locationMap.label}
      className="relative h-56 overflow-hidden rounded-2xl border border-border shadow-sm"
    >
      {near ? (
        <>
          <Map
            className="h-full"
            center={[place.longitude, place.latitude]}
            zoom={15}
            interactive={false}
            styles={{
              light: "https://tiles.openfreemap.org/styles/bright",
              dark: "https://tiles.openfreemap.org/styles/dark",
            }}
          >
            <MapMarker longitude={place.longitude} latitude={place.latitude}>
              <MarkerContent>
                <span className="relative flex size-10 items-center justify-center">
                  <span className="absolute size-10 animate-ping rounded-full bg-primary/30" />
                  <span className="relative flex size-9 items-center justify-center rounded-full border-2 border-white bg-primary shadow-lg ring-4 ring-primary/25">
                    <MapPin className="size-4 text-primary-foreground" aria-hidden />
                  </span>
                </span>
              </MarkerContent>
            </MapMarker>
          </Map>

          {/* Tap target covers the map but stops above the attribution strip. */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t.locationMap.openInMaps}
            className="group absolute inset-x-0 top-0 bottom-12 z-10 -outline-offset-2 focus-visible:outline-2"
          >
            <span className="absolute top-3 right-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-card/95 px-3.5 text-sm font-semibold shadow-md backdrop-blur transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <ExternalLink className="size-4" aria-hidden />
              {t.locationMap.openInMaps}
            </span>
          </a>
        </>
      ) : (
        <div
          aria-hidden
          className="grid h-full animate-pulse place-items-center bg-muted/40 text-muted-foreground"
        >
          <MapPin className="size-6" />
        </div>
      )}
    </section>
  );
}
