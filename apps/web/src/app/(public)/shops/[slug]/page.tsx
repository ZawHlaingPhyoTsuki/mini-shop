import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2Icon,
  GlobeIcon,
  PackageIcon,
  PhoneIcon,
  StoreIcon,
  TagIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { shopsTransport } from "@/features/shops/shops-transport";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Product } from "@/features/products/types/product";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getDictionary();
  try {
    const shop = await shopsTransport.getPublicShop(slug);
    return {
      title: t.publicShop.metaTitle(shop.name),
      description: shop.descriptionEn || t.publicShop.metaDescription(shop.name),
    };
  } catch {
    return {
      title: `Shop · Mini Shop`,
    };
  }
}

export default async function PublicShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getDictionary();

  let shop;
  try {
    shop = await shopsTransport.getPublicShop(slug);
  } catch {
    notFound();
  }

  const products: Product[] = (shop as any).products ?? [];

  return (
    <div className="container mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8 space-y-6">
      {/* Shop Profile Header */}
      <Card className="border shadow-xs overflow-hidden">
        <div className="h-24 sm:h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-muted" />
        <CardContent className="relative px-4 pb-6 pt-0 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 sm:-mt-12 mb-4">
            <div className="flex items-end gap-3.5">
              <div className="flex size-20 sm:size-24 shrink-0 items-center justify-center rounded-2xl border-4 border-background bg-card shadow-md text-primary">
                <StoreIcon className="size-10" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {shop.name}
                  </h1>
                  <Badge variant="secondary" className="gap-1 font-semibold text-xs">
                    <CheckCircle2Icon className="size-3 text-emerald-600" />
                    {t.publicShop.verifiedMerchant}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono">/shops/{shop.slug}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 pt-2 text-sm max-w-3xl">
            {shop.descriptionEn && (
              <p className="text-foreground/90 whitespace-pre-wrap">{shop.descriptionEn}</p>
            )}
            {shop.descriptionMy && (
              <p className="text-muted-foreground whitespace-pre-wrap">{shop.descriptionMy}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground border-t border-border/50">
              {shop.contactPhone && (
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <PhoneIcon className="size-3.5 text-muted-foreground" />
                  <span>{shop.contactPhone}</span>
                </div>
              )}
              {shop.socialLinks?.facebook && (
                <a
                  href={shop.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <GlobeIcon className="size-3.5" />
                  Facebook
                </a>
              )}
              {shop.socialLinks?.tiktok && (
                <a
                  href={shop.socialLinks.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <GlobeIcon className="size-3.5" />
                  TikTok
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catalog */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">{t.publicShop.productsTitle}</h2>

        {products.length === 0 ? (
          <Empty className="border border-dashed py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PackageIcon />
              </EmptyMedia>
              <EmptyTitle>{t.publicShop.emptyProducts}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((prod) => (
              <Link
                key={prod.id}
                href={`/products/${prod.slug}`}
                className="group block rounded-xl border border-border/70 bg-card p-3 shadow-xs transition hover:border-primary/40 hover:shadow-sm"
              >
                <div className="aspect-square w-full rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground group-hover:bg-muted/80 transition mb-3">
                  <PackageIcon className="size-8 opacity-40 group-hover:scale-105 transition transform" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <TagIcon className="size-3" />
                    <span className="truncate">{prod.category?.nameEn ?? "Product"}</span>
                  </div>

                  <h3 className="font-semibold text-sm line-clamp-1 text-foreground group-hover:text-primary transition-colors">
                    {prod.nameEn}
                  </h3>
                  {prod.nameMy && (
                    <p className="text-xs text-muted-foreground line-clamp-1 font-normal">
                      {prod.nameMy}
                    </p>
                  )}

                  <div className="pt-1">
                    <div className="text-sm font-bold text-foreground">
                      K {prod.priceMMK.toLocaleString()}
                    </div>
                    {prod.priceTHB && (
                      <div className="text-[11px] text-muted-foreground">
                        ฿ {prod.priceTHB.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
