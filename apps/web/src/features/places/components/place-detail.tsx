import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  MapPin,
  MessageSquareWarning,
  Navigation,
  Phone,
  Send,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { PRICE_LEVEL_LABELS } from "../places-constants";
import type { Place } from "../types/place";
import { FacebookIcon } from "@/components/icons/facebook-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { displayName } from "@/i18n/display-name";
import { getDictionary, type Dictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { PlaceGallery } from "./place-gallery";
import { PlaceLocationMap } from "./place-location-map";
import { SharePlaceButton } from "./share-place-button";
import { formatRelativeUpdated } from "./relative-updated";

type IconType = LucideIcon | typeof FacebookIcon;

function getDirectionsUrl(place: Place): string | null {
  if (place.latitude !== null && place.longitude !== null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
  }
  if (place.addressText) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.addressText)}`;
  }
  return null;
}

function Actions({
  place,
  t,
  className = "",
}: {
  place: Place;
  t: Dictionary;
  className?: string;
}) {
  const directionsUrl = getDirectionsUrl(place);
  const telHref = place.phone ? `tel:${place.phone.replace(/[^\d+]/g, "")}` : null;
  if (!directionsUrl && !telHref) return null;

  const base =
    "inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold outline-offset-2 transition-all focus-visible:outline-2";

  return (
    <div className={`flex gap-2 ${className}`}>
      {directionsUrl ? (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${base} bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:-translate-y-0.5 hover:bg-primary/90`}
        >
          <Navigation className="size-4" aria-hidden />
          {t.detail.directions}
        </a>
      ) : null}
      {telHref ? (
        <a
          href={telHref}
          className={`${base} border border-border bg-card hover:border-primary/40 hover:bg-secondary`}
        >
          <Phone className="size-4" aria-hidden />
          {t.detail.call}
        </a>
      ) : null}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: IconType;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 pt-0.5">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="leading-relaxed wrap-break-word whitespace-pre-line">{children}</dd>
      </div>
    </div>
  );
}

function Chip({ children, tone = "muted" }: { children: ReactNode; tone?: "primary" | "muted" }) {
  return (
    <span
      className={
        tone === "primary"
          ? "rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm leading-normal font-semibold text-primary"
          : "rounded-full border border-border bg-card px-3 py-1 text-sm leading-normal text-foreground"
      }
    >
      {children}
    </span>
  );
}

const linkClass = "underline-offset-4 hover:text-primary hover:underline";

export async function PlaceDetail({
  place,
  nearbyPlaces,
}: {
  place: Place;
  nearbyPlaces: Place[];
}) {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const hasMap = place.latitude !== null && place.longitude !== null;
  const hasInfo =
    place.addressText ||
    place.hoursText ||
    place.phone ||
    place.phoneSecondary ||
    place.facebookUrl ||
    place.telegramHandle ||
    place.priceNote;
  const name = displayName(place.nameMy, place.nameEn, locale);
  const secondaryName = displayName(place.nameEn, place.nameMy, locale);

  return (
    <>
      <article className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <PlaceGallery photos={place.photos} name={name} />
        </div>

        <header className="min-w-0 lg:col-start-1 lg:row-start-2">
          <div className="flex flex-wrap gap-2">
            <Chip tone="primary">
              {displayName(place.category.nameMy, place.category.nameEn, locale)}
            </Chip>
            {place.area ? (
              <Chip>{displayName(place.area.nameMy, place.area.nameEn, locale)}</Chip>
            ) : null}
            {place.priceLevel ? (
              <Chip>
                {PRICE_LEVEL_LABELS[place.priceLevel].symbol} · {t.priceLevels[place.priceLevel]}
              </Chip>
            ) : null}
          </div>

          <h1 className="mt-4 font-heading text-3xl leading-[1.4] font-semibold tracking-tight text-balance sm:text-4xl">
            {name}
          </h1>
          {secondaryName && secondaryName !== name ? (
            <p className="mt-1 text-lg text-muted-foreground">{secondaryName}</p>
          ) : null}

          {place.tags.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {place.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-secondary px-3 py-1 text-sm leading-normal text-secondary-foreground"
                >
                  {t.tagLabels[tag]}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{t.detail.updated(formatRelativeUpdated(place.updatedAt, locale))}</span>
            <SharePlaceButton title={name} label={t.detail.share} copiedLabel={t.detail.copied} />
          </div>
        </header>

        {/* Sidebar: actions + facts */}
        <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm lg:sticky lg:top-24 lg:col-start-2 lg:row-span-3 lg:row-start-1">
          <Actions place={place} t={t} className="hidden lg:flex" />
          {hasInfo ? (
            <dl className="grid gap-4 lg:mt-6">
              {place.addressText ? (
                <InfoRow icon={MapPin} label={t.detail.address}>
                  {place.addressText}
                </InfoRow>
              ) : null}
              {place.hoursText ? (
                <InfoRow icon={Clock} label={t.detail.hours}>
                  {place.hoursText}
                </InfoRow>
              ) : null}
              {place.phone ? (
                <InfoRow icon={Phone} label={t.detail.phone}>
                  <a href={`tel:${place.phone.replace(/[^\d+]/g, "")}`} className={linkClass}>
                    {place.phone}
                  </a>
                </InfoRow>
              ) : null}
              {place.phoneSecondary ? (
                <InfoRow icon={Phone} label={t.detail.phoneSecondary}>
                  <a
                    href={`tel:${place.phoneSecondary.replace(/[^\d+]/g, "")}`}
                    className={linkClass}
                  >
                    {place.phoneSecondary}
                  </a>
                </InfoRow>
              ) : null}
              {place.priceNote ? (
                <InfoRow icon={Wallet} label={t.detail.price}>
                  {place.priceNote}
                </InfoRow>
              ) : null}
              {place.facebookUrl ? (
                <InfoRow icon={FacebookIcon} label={t.detail.facebook}>
                  <a
                    href={place.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {t.detail.facebook}
                  </a>
                </InfoRow>
              ) : null}
              {place.telegramHandle ? (
                <InfoRow icon={Send} label={t.detail.telegram}>
                  <a
                    href={`https://t.me/${place.telegramHandle.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    @{place.telegramHandle.replace(/^@/, "")}
                  </a>
                </InfoRow>
              ) : null}
            </dl>
          ) : null}

          {hasMap ? (
            <div className="mt-6">
              <h2 className="sr-only">{t.detail.location}</h2>
              <PlaceLocationMap place={place} />
            </div>
          ) : null}
        </section>

        {place.descriptionMy ? (
          <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-6 lg:col-start-1 lg:row-start-3">
            <h2 className="sr-only">{t.detail.about}</h2>
            <p className="max-w-prose text-base leading-loose whitespace-pre-line">
              {place.descriptionMy}
            </p>
          </section>
        ) : null}

        <Link
          href={`/contact?place=${encodeURIComponent(name)}` as never}
          className="group flex items-center gap-3 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground lg:col-start-1 lg:row-start-4"
        >
          <MessageSquareWarning className="size-4 shrink-0 text-primary" aria-hidden />
          <span className="flex-1 leading-relaxed">{t.detail.correction}</span>
          <ArrowRight
            className="size-4 shrink-0 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      </article>

      {nearbyPlaces.length > 0 ? (
        <section className="mt-12 grid gap-4">
          <h2 className="font-heading text-2xl leading-[1.4] font-semibold">{t.detail.nearby}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {nearbyPlaces.map((nearby) => {
              const nearbyName = displayName(nearby.nameMy, nearby.nameEn, locale);
              return (
                <Link
                  key={nearby.id}
                  href={`/places/${nearby.id}`}
                  className="group flex min-w-0 items-center gap-4 rounded-2xl border border-border/70 bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  {nearby.photos[0] ? (
                    <img
                      src={nearby.photos[0]}
                      alt=""
                      loading="lazy"
                      className="size-20 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="grid size-20 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                      <MapPin className="size-5" aria-hidden />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{nearbyName}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {displayName(nearby.category.nameMy, nearby.category.nameEn, locale)}
                    </span>
                  </span>
                  <ArrowRight
                    className="mr-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                    aria-hidden
                  />
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Mobile: the two actions people come here for stay within thumb reach. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <Actions place={place} t={t} className="mx-auto max-w-3xl" />
      </div>
    </>
  );
}

export async function PlaceDetailSkeleton() {
  const t = await getDictionary();
  return (
    <div
      className="grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1fr)_23rem]"
      aria-busy="true"
      aria-label={t.detail.loading}
    >
      <div className="grid gap-6">
        <Skeleton className="aspect-4/3 w-full rounded-3xl sm:aspect-video" />
        <div className="grid gap-3">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
        </div>
      </div>
      <div className="grid gap-4 rounded-3xl border border-border/70 p-5">
        <Skeleton className="h-12 w-full rounded-full" />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
