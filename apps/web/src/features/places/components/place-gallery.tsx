"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

import { PhotoPreviewDialog } from "./photo-preview-dialog";
import { useDictionary } from "@/i18n/dictionary-provider";

export function PlaceGallery({ photos, name }: { photos: string[]; name: string }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const t = useDictionary();
  const [index, setIndex] = useState(0);
  const [preview, setPreview] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div
        className="bg-muted text-muted-foreground flex aspect-4/3 w-full flex-col items-center justify-center gap-2 rounded-3xl sm:aspect-video"
        role="img"
        aria-label={t.gallery.noPhotos}
      >
        <ImageOff className="size-6" aria-hidden />
        <span className="text-sm">{t.gallery.noPhotos}</span>
      </div>
    );
  }

  function go(direction: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  }

  function scrollTo(photoIndex: number) {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: photoIndex * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  }

  const arrow =
    "bg-background/90 text-foreground hover:bg-background absolute top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full shadow-md outline-offset-2 focus-visible:outline-2 disabled:pointer-events-none disabled:opacity-0 md:flex";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-muted shadow-md">
      <ul
        ref={trackRef}
        tabIndex={0}
        aria-label={t.gallery.photosOf(name)}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="flex snap-x snap-mandatory overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((photo, i) => (
          <li
            key={photo}
            className="relative aspect-4/3 w-full shrink-0 snap-center sm:aspect-video"
          >
            <Image
              src={photo}
              alt={i === 0 ? name : `${name} photo ${i + 1}`}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="(max-width: 1024px) 100vw, 640px"
            />
            <button
              type="button"
              onClick={() => setPreview(i)}
              aria-label={t.gallery.expand(i + 1, photos.length)}
              className="absolute inset-0 cursor-zoom-in outline-offset-2 focus-visible:outline-2"
            />
          </li>
        ))}
      </ul>

      {photos.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={index === 0}
            aria-label={t.gallery.previous}
            className={`${arrow} left-3`}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={index === photos.length - 1}
            aria-label={t.gallery.next}
            className={`${arrow} right-3`}
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
          <span
            className="absolute right-3 bottom-3 rounded-full bg-black/65 px-2.5 py-1 text-xs text-white tabular-nums"
            aria-live="polite"
          >
            {index + 1} / {photos.length}
          </span>
        </>
      ) : null}

      {preview !== null ? (
        <PhotoPreviewDialog
          photos={photos}
          index={preview}
          placeName={name}
          open
          onOpenChange={(o) => {
            if (!o) setPreview(null);
          }}
          onIndexChange={(i) => {
            setPreview(i);
            scrollTo(i);
          }}
        />
      ) : null}
    </div>
  );
}
