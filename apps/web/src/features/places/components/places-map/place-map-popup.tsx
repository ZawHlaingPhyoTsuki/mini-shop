"use client";

import type { Route } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { MapPopup } from "@/components/ui/map";
import { useDictionary, useLocale } from "@/i18n/dictionary-provider";
import { displayName } from "@/i18n/display-name";

import type { Place } from "../../types/place";
import { ArrowRight } from "lucide-react";

export function PlaceMapPopup({
  place,
  onClose,
}: {
  place: Place & { latitude: number; longitude: number };
  onClose: () => void;
}) {
  const t = useDictionary();
  const locale = useLocale();
  const name = displayName(place.nameMy, place.nameEn, locale);
  return (
    <MapPopup
      longitude={place.longitude}
      latitude={place.latitude}
      onClose={onClose}
      closeOnClick={false}
      closeButton
      className="w-64 max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl"
    >
      <div className="grid w-full grid-cols-[minmax(0,1fr)] gap-3">
        {place.photos[0] ? (
          <img
            src={place.photos[0]}
            alt=""
            loading="lazy"
            className="h-28 w-full rounded-xl object-cover"
          />
        ) : null}
        <div className="grid min-w-0 gap-1">
          <span className="w-fit max-w-full truncate rounded-full bg-primary/10 px-2.5 py-0.5 text-xs leading-normal font-semibold text-primary">
            {displayName(place.category.nameMy, place.category.nameEn, locale)}
          </span>
          <p className="font-heading leading-snug font-semibold wrap-break-word">{name}</p>
          {place.hoursText || place.priceNote ? (
            <p className="text-xs leading-relaxed wrap-break-word text-muted-foreground">
              {[place.hoursText, place.priceNote].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </div>
        <Link
          href={`/places/${place.id}` as Route}
          className={buttonVariants({
            size: "sm",
            className: "h-10 w-full gap-1.5 rounded-full font-semibold",
          })}
        >
          {t.popup.viewPlace}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </MapPopup>
  );
}
