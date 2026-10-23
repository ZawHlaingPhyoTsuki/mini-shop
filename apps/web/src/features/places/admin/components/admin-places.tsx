"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPinIcon, SearchIcon } from "lucide-react";

import { deletePlace, updatePlace } from "../../places-actions";
import { AdminPlaceForm } from "./admin-place-form";
import { PhotoPreviewDialog } from "../../components/photo-preview-dialog";
import type { Category } from "@/features/categories/types/category";
import type { Area } from "@/features/areas/types/area";

import type { Place } from "../../types/place";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useDictionary, useLocale } from "@/i18n/dictionary-provider";
import { displayName } from "@/i18n/display-name";

export function AdminPlaces({
  initialPlaces,
  categories,
  areas,
}: {
  initialPlaces: Place[];
  categories: Category[];
  areas: Area[];
}) {
  const [places, setPlaces] = useState(initialPlaces);
  const [editing, setEditing] = useState<Place | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    photos: string[];
    name: string;
    index: number;
  } | null>(null);
  const t = useDictionary();
  const locale = useLocale();

  const filteredPlaces = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return places;
    return places.filter((place) =>
      [place.nameMy, place.nameEn, place.area?.nameMy, place.addressText].some((value) =>
        value?.toLocaleLowerCase().includes(query),
      ),
    );
  }, [places, search]);

  function savedPlace(saved: Place) {
    setPlaces((current) => {
      const exists = current.some((place) => place.id === saved.id);
      return exists
        ? current.map((place) => (place.id === saved.id ? saved : place))
        : [saved, ...current];
    });
    setEditing(null);
    setIsCreating(false);
  }

  async function toggleActive(place: Place) {
    setError(null);
    setIsUpdating(place.id);
    try {
      const saved = await updatePlace(place.id, { isActive: !place.isActive });
      setPlaces((current) => current.map((item) => (item.id === saved.id ? saved : item)));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.adminPlaces.errorUpdate);
    } finally {
      setIsUpdating(null);
    }
  }

  async function remove(place: Place) {
    setError(null);
    setIsUpdating(place.id);
    try {
      await deletePlace(place.id);
      setPlaces((current) => current.filter((item) => item.id !== place.id));
      setDeleting(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.adminPlaces.errorDelete);
    } finally {
      setIsUpdating(null);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-1">
          <p className="text-sm text-muted-foreground">{t.adminPlaces.kicker}</p>
          <h2 className="text-2xl font-semibold tracking-tight">{t.adminPlaces.title}</h2>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setIsCreating(true);
          }}
        >
          {t.adminPlaces.addPlace}
        </Button>
      </div>
      <Sheet
        open={isCreating || Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
            setIsCreating(false);
          }
        }}
      >
        <SheetContent side="right" className="sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>
              {editing
                ? t.adminPlaces.editPlace(displayName(editing.nameMy, editing.nameEn, locale))
                : t.adminPlaces.addPlace}
            </SheetTitle>
            <SheetDescription>{t.adminPlaces.sheetDescription}</SheetDescription>
          </SheetHeader>
          <ScrollArea className="min-h-0 flex-1 px-4 pb-6">
            <AdminPlaceForm
              key={editing?.id ?? "new"}
              categories={categories}
              areas={areas}
              place={editing}
              existingSlugs={places
                .filter((item) => item.id !== editing?.id)
                .map((item) => item.slug)}
              onSaved={savedPlace}
              onCancel={() => {
                setEditing(null);
                setIsCreating(false);
              }}
            />
            <ScrollBar />
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="grid gap-1">
          <label htmlFor="place-search" className="text-sm font-medium">
            {t.adminPlaces.findLabel}
          </label>
          <p className="text-xs text-muted-foreground">{t.adminPlaces.findHint}</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {search.trim()
              ? t.adminPlaces.countFiltered(filteredPlaces.length, places.length)
              : t.adminPlaces.countAll(places.length)}
          </p>
        </div>
        <Input
          id="place-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t.adminPlaces.searchPlaceholder}
        />
      </div>
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
      {places.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MapPinIcon />
            </EmptyMedia>
            <EmptyTitle>{t.adminPlaces.emptyTitle}</EmptyTitle>
            <EmptyDescription>{t.adminPlaces.emptyBody}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : filteredPlaces.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchIcon />
            </EmptyMedia>
            <EmptyTitle>{t.adminPlaces.noMatchTitle}</EmptyTitle>
            <EmptyDescription>{t.adminPlaces.noMatchBody}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ItemGroup>
          {filteredPlaces.map((place) => (
            <Item
              key={place.id}
              size="sm"
              variant="outline"
              className="bg-card sm:flex-nowrap hover:bg-muted/30"
            >
              {place.photos[0] ? (
                <ItemMedia variant="image">
                  <button
                    type="button"
                    onClick={() =>
                      setPreview({
                        photos: place.photos,
                        name: displayName(place.nameMy, place.nameEn, locale),
                        index: 0,
                      })
                    }
                    aria-label={t.adminPlaces.viewPhotos(
                      displayName(place.nameMy, place.nameEn, locale),
                    )}
                    className="block size-full cursor-zoom-in"
                  >
                    <img src={place.photos[0]} alt="" />
                  </button>
                </ItemMedia>
              ) : null}
              {place.photos.length > 1 ? (
                <span className="text-xs text-muted-foreground tabular-nums">
                  +{place.photos.length - 1}
                </span>
              ) : null}
              <ItemContent className="min-w-0">
                <ItemTitle>
                  {displayName(place.nameMy, place.nameEn, locale)}
                  {locale === "my" &&
                  place.nameEn &&
                  place.nameEn !== displayName(place.nameMy, place.nameEn, locale) ? (
                    <span className="text-muted-foreground">{place.nameEn}</span>
                  ) : null}
                  {locale === "en" &&
                  place.nameMy &&
                  place.nameMy !== displayName(place.nameMy, place.nameEn, locale) ? (
                    <span className="text-muted-foreground">{place.nameMy}</span>
                  ) : null}
                </ItemTitle>
                <ItemDescription>
                  {displayName(place.category.nameMy, place.category.nameEn, locale)}
                  {place.area
                    ? ` · ${displayName(place.area.nameMy, place.area.nameEn, locale)}`
                    : ""}
                </ItemDescription>
              </ItemContent>
              <ItemActions className="max-sm:basis-full max-sm:justify-end">
                <Badge variant={place.isActive ? "default" : "outline"}>
                  {place.isActive ? t.adminPlaces.published : t.adminPlaces.hidden}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setEditing(place);
                  }}
                >
                  {t.adminPlaces.edit}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isUpdating === place.id}
                  onClick={() => toggleActive(place)}
                >
                  {isUpdating === place.id
                    ? t.adminPlaces.updating
                    : place.isActive
                      ? t.adminPlaces.hide
                      : t.adminPlaces.publish}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleting(place.id)}>
                  {t.adminPlaces.delete}
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      )}
      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.adminPlaces.deleteTitle}</DialogTitle>
            <DialogDescription>{t.adminPlaces.deleteBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              {t.adminPlaces.keepPlace}
            </Button>
            <Button
              variant="destructive"
              disabled={!deleting || isUpdating === deleting}
              onClick={() => {
                const place = places.find((item) => item.id === deleting);
                if (place) void remove(place);
              }}
            >
              {deleting && isUpdating === deleting
                ? t.adminPlaces.deleting
                : t.adminPlaces.deleteConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <PhotoPreviewDialog
        photos={preview?.photos ?? []}
        index={preview?.index ?? 0}
        placeName={preview?.name ?? ""}
        open={preview !== null}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
        onIndexChange={(index) =>
          setPreview((current) => (current ? { ...current, index } : current))
        }
      />
    </div>
  );
}

export function AdminPlacesSkeleton() {
  const t = useDictionary();
  return (
    <div className="grid gap-2" aria-busy="true" aria-label={t.adminPlaces.loading}>
      {[0, 1, 2].map((item) => (
        <Skeleton key={item} className="h-20 w-full" />
      ))}
    </div>
  );
}
