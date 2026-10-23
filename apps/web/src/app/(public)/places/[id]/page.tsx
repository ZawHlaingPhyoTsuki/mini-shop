import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PlaceDetail } from "@/features/places/components/place-detail";
import { getPlace, getPlaces } from "@/features/places/places-queries";
import { PublicFooter } from "@/components/public-footer";
import { displayName } from "@/i18n/display-name";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";

export async function generateMetadata({ params }: PageProps<"/places/[id]">): Promise<Metadata> {
  const place = await getPlace((await params).id);
  const locale = await getLocale();
  const primary = displayName(place.nameMy, place.nameEn, locale);
  const secondary = displayName(place.nameEn, place.nameMy, locale);
  return {
    title: secondary && secondary !== primary ? `${primary} · ${secondary}` : primary,
    openGraph: place.photos[0] ? { images: [place.photos[0]] } : undefined,
  };
}

// Deliberately async (not params.then + Suspense): the existence check must
// resolve before anything streams, otherwise a missing Place returns HTTP 200
// with not-found UI (soft 404) instead of a real 404. The identical fetch in
// generateMetadata above is deduplicated by fetch memoization.
export default async function PlacePage({ params }: PageProps<"/places/[id]">) {
  const { id } = await params;
  const place = await getPlace(id);
  const [nearby, t, locale] = await Promise.all([
    place.area ? getPlaces({ area: place.area.slug }) : Promise.resolve([]),
    getDictionary(),
    getLocale(),
  ]);
  const nearbyPlaces = nearby.filter((item) => item.id !== place.id).slice(0, 4);
  const name = displayName(place.nameMy, place.nameEn, locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name,
    url: `/places/${place.slug}`,
    image: place.photos,
    telephone: place.phone ?? undefined,
    address: place.addressText
      ? { "@type": "PostalAddress", streetAddress: place.addressText }
      : undefined,
    geo:
      place.latitude !== null && place.longitude !== null
        ? {
            "@type": "GeoCoordinates",
            latitude: place.latitude,
            longitude: place.longitude,
          }
        : undefined,
    sameAs: [
      place.facebookUrl,
      place.telegramHandle ? `https://t.me/${place.telegramHandle.replace(/^@/, "")}` : null,
    ].filter(Boolean),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="bg-linear-to-b from-primary/10 to-transparent">
        {/* pb-28 on mobile leaves room for the fixed action bar. */}
        <div className="mx-auto max-w-6xl px-4 pt-4 pb-28 sm:pt-6 lg:pb-14">
          <Link
            href="/map"
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t.detailBack}
          </Link>
          <div className="mt-4">
            <PlaceDetail place={place} nearbyPlaces={nearbyPlaces} />
          </div>
        </div>
      </div>
      <div className="pb-24 lg:pb-0">
        <PublicFooter />
      </div>
    </>
  );
}
