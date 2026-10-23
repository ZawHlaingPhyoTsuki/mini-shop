"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "cn";

import { useDictionary, useLocale } from "@/i18n/dictionary-provider";
import { displayName } from "@/i18n/display-name";

import type { Place } from "../types/place";

export function PlaceListItem({
  place,
  active,
  onSelect,
}: {
  place: Place;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const t = useDictionary();
  const locale = useLocale();
  const name = displayName(place.nameMy, place.nameEn, locale);
  const secondary = displayName(place.nameEn, place.nameMy, locale);

  // Keep the selected row visible when selection comes from the map.
  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [active]);

  const status = [place.hoursText, place.priceNote].filter(Boolean).join(" · ");

  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-sm transition-all",
        "hover:border-primary/40 hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:outline-none",
        active && "border-primary bg-primary/5 ring-1 ring-primary",
      )}
    >
      <button
        ref={ref}
        type="button"
        onClick={() => onSelect(place.id)}
        aria-pressed={active}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left focus:outline-none"
      >
        {place.photos[0] ? (
          <img
            src={place.photos[0]}
            alt=""
            loading="lazy"
            className="size-20 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="bg-muted text-muted-foreground flex size-20 shrink-0 items-center justify-center rounded-md text-xs"
          >
            {t.listItem.noPhoto}
          </div>
        )}
        <span className="grid min-w-0 flex-1 gap-0.5">
          <span className="truncate font-medium">{name}</span>
          {secondary && secondary !== name ? (
            <span className="text-muted-foreground truncate text-sm">{secondary}</span>
          ) : null}
          <span className="text-muted-foreground truncate text-xs">
            {displayName(place.category.nameMy, place.category.nameEn, locale)}
            {place.area ? ` · ${displayName(place.area.nameMy, place.area.nameEn, locale)}` : ""}
          </span>
          {status ? <span className="truncate text-xs">{status}</span> : null}
        </span>
      </button>
      <Link
        href={`/places/${place.id}` as Route}
        aria-label={t.listItem.viewDetails(name)}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex size-9 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <ArrowUpRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
