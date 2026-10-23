import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, Languages, MapPin, MapPinned, Share2 } from "lucide-react";

import { PublicFooter } from "@/components/public-footer";
import { buttonVariants } from "@/components/ui/button";
import { categoriesTransport } from "@/features/categories/categories-transport";
import { LandingSearch } from "@/features/places/components/landing-search";
import { displayName } from "@/i18n/display-name";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";

const highlightIcons = [MapPinned, Languages, Share2];

const pins = [
  { top: "20%", left: "26%", active: false },
  { top: "38%", left: "62%", active: true },
  { top: "64%", left: "36%", active: false },
  { top: "28%", left: "82%", active: false },
  { top: "72%", left: "74%", active: false },
];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.landing.metaTitle, description: t.landing.metaDescription };
}

export default async function LandingPage() {
  const [categories, t, locale] = await Promise.all([
    categoriesTransport.getCategories(),
    getDictionary(),
    getLocale(),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="border-b border-border/60 bg-linear-to-b from-primary/10 to-transparent">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-12 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:py-24">
          {/* Left: copy + actions */}
          <div className="flex min-w-0 flex-col items-start gap-5">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              <MapPin className="size-3.5" aria-hidden />
              {t.landing.eyebrow}
            </p>

            <h1 className="font-heading text-4xl leading-[1.3] font-semibold tracking-tight wrap-break-word text-balance sm:text-5xl lg:text-6xl">
              {t.landing.title}
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t.landing.subtitle}
            </p>

            {/* PRIMARY ACTION */}
            <Link
              href={"/map" as Route}
              className={buttonVariants({
                size: "lg",
                className:
                  "mt-1 h-14 w-full gap-2 rounded-full px-8 text-base font-semibold shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 sm:w-auto",
              })}
            >
              <MapPin className="size-5" aria-hidden />
              {t.landing.browseMap}
              <ArrowRight className="size-5" aria-hidden />
            </Link>

            {/* SECONDARY: search */}
            <div className="w-full max-w-xl pt-1">
              <LandingSearch />
            </div>

            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 8).map((category) => (
                  <Link
                    key={category.id}
                    href={`/map?category=${encodeURIComponent(category.slug)}` as Route}
                    className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-secondary"
                  >
                    {displayName(category.nameMy, category.nameEn, locale)}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          {/* Right: map preview card (decorative, clickable) */}
          <Link
            href={"/map" as Route}
            aria-label={t.landing.browseMap}
            className="group relative block aspect-4/3 overflow-hidden rounded-3xl border border-border bg-card shadow-xl transition-shadow hover:shadow-2xl"
          >
            {/* dotted grid */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--border)_1px,transparent_0)] bg-size-[22px_22px]" />
            {/* "roads" */}
            <div className="absolute top-[46%] left-[-10%] h-3 w-[120%] -rotate-12 rounded-full bg-muted" />
            <div className="absolute top-[-10%] left-[38%] h-[120%] w-3 rotate-18 rounded-full bg-muted" />
            <div className="absolute top-[18%] left-[-10%] h-2 w-[120%] rotate-6 rounded-full bg-muted/70" />

            {/* pins */}
            {pins.map((pin, i) => (
              <span
                key={i}
                className="absolute -translate-x-1/2 -translate-y-full"
                style={{ top: pin.top, left: pin.left }}
              >
                {pin.active ? (
                  <span className="absolute bottom-0 left-1/2 size-8 -translate-x-1/2 animate-ping rounded-full bg-primary/40" />
                ) : null}
                <span
                  className={
                    pin.active
                      ? "relative grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg"
                      : "relative grid size-8 place-items-center rounded-full border border-border bg-card text-primary shadow-md"
                  }
                >
                  <MapPin className={pin.active ? "size-5" : "size-4"} aria-hidden />
                </span>
              </span>
            ))}

            {/* category chips on the map */}
            {categories.length > 0 ? (
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 pr-4">
                {categories.slice(0, 3).map((category) => (
                  <span
                    key={category.id}
                    className="rounded-full bg-card/95 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur"
                  >
                    {displayName(category.nameMy, category.nameEn, locale)}
                  </span>
                ))}
              </div>
            ) : null}

            {/* hover hint */}
            <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-md transition-transform group-hover:scale-105">
              {t.nav.map}
              <ArrowRight className="size-3.5" aria-hidden />
            </span>
          </Link>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <ol className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {t.landing.highlights.map((highlight, i) => {
            const Icon = highlightIcons[i] ?? MapPin;
            return (
              <li
                key={highlight.title}
                className="relative rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span
                  aria-hidden
                  className="absolute top-5 right-5 font-heading text-3xl font-semibold text-border"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mb-4 grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h2 className="font-heading text-lg leading-snug font-semibold">
                  {highlight.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {highlight.body}
                </p>
              </li>
            );
          })}
        </ol>
      </section>
      <PublicFooter />
    </>
  );
}
