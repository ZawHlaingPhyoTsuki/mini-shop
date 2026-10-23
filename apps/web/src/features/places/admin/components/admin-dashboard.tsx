import Link from "next/link";
import { Suspense } from "react";
import type { Route } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getAdminPlaceSummary, getAdminPlaces } from "../../places-queries";
import { PlacesMapSkeleton } from "../../components/places-map/places-map";
import { AdminPlacesMap } from "./admin-places-map";
import { getDictionary } from "@/i18n/get-dictionary";

async function AdminPlacesMapContent() {
  const [places, t] = await Promise.all([getAdminPlaces(), getDictionary()]);
  return (
    <section className="grid gap-3">
      <div>
        <h2 className="text-lg font-semibold">{t.overview.mapTitle}</h2>
        <p className="text-sm text-muted-foreground">{t.overview.mapBody}</p>
      </div>
      <AdminPlacesMap places={places} />
    </section>
  );
}

export async function AdminDashboard() {
  const [summary, t] = await Promise.all([getAdminPlaceSummary(), getDictionary()]);

  return (
    <div className="grid gap-8">
      <section className="grid gap-2 border-b pb-6">
        <p className="text-sm text-muted-foreground">{t.overview.introKicker}</p>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight">{t.overview.introTitle}</h1>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">{t.overview.introBody}</p>
      </section>
      <section className="grid gap-3 sm:grid-cols-3" aria-label={t.overview.summaryLabel}>
        <SummaryCard
          label={t.overview.allPlaces}
          value={summary.allPlaces}
          detail={t.overview.allPlacesDetail}
        />
        <SummaryCard
          label={t.overview.published}
          value={summary.publishedPlaces}
          detail={t.overview.publishedDetail}
        />
        <SummaryCard
          label={t.overview.areasCovered}
          value={summary.areasCovered}
          detail={t.overview.hiddenDetail(summary.hiddenPlaces)}
        />
      </section>
      <Suspense fallback={<PlacesMapSkeleton />}>
        <AdminPlacesMapContent />
      </Suspense>
      <section className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-5 text-sm">
        <Link
          href={"/dashboard/places" as Route}
          className="font-medium underline underline-offset-4"
        >
          {t.overview.managePlaces}
        </Link>
        <Link href={"/" as Route} className="text-muted-foreground underline underline-offset-4">
          {t.overview.viewPublic}
        </Link>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <Card>
      <CardHeader className="gap-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <p className="text-3xl font-semibold tabular-nums">{value}</p>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">{detail}</CardContent>
    </Card>
  );
}

export async function AdminDashboardSkeleton() {
  const t = await getDictionary();
  return (
    <div
      className="h-72 animate-pulse border bg-muted/30"
      aria-busy="true"
      aria-label={t.overview.loading}
    />
  );
}
