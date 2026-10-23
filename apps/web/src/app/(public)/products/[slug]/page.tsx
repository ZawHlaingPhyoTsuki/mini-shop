import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  PackageIcon,
  StoreIcon,
  TagIcon,
  TruckIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { productsTransport } from "@/features/products/products-transport";
import { getDictionary } from "@/i18n/get-dictionary";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getDictionary();
  try {
    const product = await productsTransport.getPublicProduct(slug);
    return {
      title: t.publicProduct.metaTitle(product.nameEn),
      description: product.descriptionEn || `${product.nameEn} on Mini Shop`,
    };
  } catch {
    return {
      title: `Product · Mini Shop`,
    };
  }
}

export default async function PublicProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getDictionary();

  let product;
  try {
    product = await productsTransport.getPublicProduct(slug);
  } catch {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl px-3 py-6 sm:px-4 sm:py-8 space-y-6">
      <Link
        href="/"
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "gap-1.5 -ml-2 text-muted-foreground",
        })}
      >
        <ArrowLeftIcon className="size-4" />
        {t.publicProduct.backToCatalog}
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Product Visual Placeholder */}
        <div className="aspect-square w-full rounded-2xl border border-border/80 bg-muted/40 flex items-center justify-center text-muted-foreground shadow-xs">
          <PackageIcon className="size-20 opacity-30" />
        </div>

        {/* Product Info */}
        <div className="space-y-5">
          <div className="space-y-1.5">
            {product.category && (
              <Badge variant="outline" className="gap-1 text-xs font-normal">
                <TagIcon className="size-3" />
                {product.category.nameEn}
              </Badge>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {product.nameEn}
            </h1>
            {product.nameMy && (
              <p className="text-base text-muted-foreground font-normal">{product.nameMy}</p>
            )}
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
              K {product.priceMMK.toLocaleString()}
            </div>
            {product.priceTHB && (
              <div className="text-sm font-medium text-muted-foreground mt-0.5">
                ฿ {product.priceTHB.toLocaleString()}
              </div>
            )}

            <div className="mt-3 flex items-center gap-2 text-xs">
              {product.stockQuantity !== null && product.stockQuantity <= 0 ? (
                <Badge variant="destructive">{t.publicProduct.outOfStock}</Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10"
                >
                  <CheckCircle2Icon className="size-3" />
                  {t.publicProduct.inStock(product.stockQuantity)}
                </Badge>
              )}
              {product.sku && (
                <span className="text-muted-foreground font-mono">
                  {t.publicProduct.sku}: {product.sku}
                </span>
              )}
            </div>
          </div>

          {/* Descriptions */}
          {product.descriptionEn && (
            <div className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </h3>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {product.descriptionEn}
              </p>
            </div>
          )}

          {product.descriptionMy && (
            <div className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ဖော်ပြချက်
              </h3>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {product.descriptionMy}
              </p>
            </div>
          )}

          {/* COD Notice */}
          <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3.5 text-xs text-muted-foreground">
            <TruckIcon className="size-5 shrink-0 text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-foreground text-sm">Cash on Delivery (COD)</p>
              <p className="mt-0.5">{t.publicProduct.codNotice}</p>
            </div>
          </div>

          {/* Shop Card */}
          {product.shop && (
            <Card className="border shadow-xs">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <StoreIcon className="size-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground font-medium block">
                      {t.publicProduct.byShop}
                    </span>
                    <Link
                      href={`/shops/${product.shop.slug}`}
                      className="font-bold text-sm text-foreground hover:text-primary transition-colors hover:underline"
                    >
                      {product.shop.name}
                    </Link>
                  </div>
                </div>

                <Link
                  href={`/shops/${product.shop.slug}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  {t.landing.viewShop}
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
