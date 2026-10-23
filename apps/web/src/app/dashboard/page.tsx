import Link from "next/link";
import {
  ArrowRightIcon,
  ClockIcon,
  PlusIcon,
  ShieldCheckIcon,
  StoreIcon,
  TagIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerSession } from "@/features/auth/admin-session";
import { shopsTransport } from "@/features/shops/shops-transport";
import { productsTransport } from "@/features/products/products-transport";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Product } from "@/features/products/types/product";
import type { AdminShop } from "@/features/shops/types/shop";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [t, session] = await Promise.all([getDictionary(), getServerSession()]);

  const shop = await shopsTransport.getMyShop();
  let products: Product[] = [];
  if (shop) {
    try {
      products = await productsTransport.getMerchantProducts();
    } catch {
      products = [];
    }
  }

  const isAdmin = session?.user.role === "admin";
  let adminShops: AdminShop[] = [];
  if (isAdmin) {
    try {
      adminShops = await shopsTransport.getAdminShops();
    } catch {
      adminShops = [];
    }
  }

  const publishedCount = products.filter((p) => p.status === "PUBLISHED").length;
  const draftCount = products.filter((p) => p.status === "DRAFT").length;
  const pendingShopsCount = adminShops.filter((s) => s.status === "PENDING_REVIEW").length;

  return (
    <div className="grid gap-6">
      {/* Intro */}
      <div className="flex flex-col gap-1 border-b pb-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          {t.overview.introKicker}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">{t.overview.introTitle}</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">{t.overview.introBody}</p>
      </div>

      {/* Admin Quick Banner */}
      {isAdmin && (
        <Card className="border-primary/20 bg-primary/5 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="size-5 text-primary shrink-0" />
              <div>
                <CardTitle className="text-base">{t.overview.adminHeading}</CardTitle>
                <CardDescription className="text-xs">
                  {t.overview.pendingShopsNotice(pendingShopsCount)}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/dashboard/admin/shops"
                className={buttonVariants({ size: "sm", variant: "default", className: "gap-1.5" })}
              >
                <ClockIcon className="size-3.5" />
                {t.overview.reviewQueueAction}
              </Link>
              <Link
                href="/dashboard/categories"
                className={buttonVariants({ size: "sm", variant: "outline", className: "gap-1.5" })}
              >
                <TagIcon className="size-3.5" />
                {t.overview.manageCategoriesAction}
              </Link>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Merchant Shop Status Card */}
      {!shop ? (
        <Card className="border-dashed border-2 bg-muted/20">
          <CardHeader className="gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <StoreIcon className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{t.overview.registerPrompt}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {t.merchantShop.registrationSubtitle}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/shop" className={buttonVariants({ className: "gap-1.5" })}>
              <StoreIcon className="size-4" />
              {t.overview.registerAction}
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">{t.overview.statusLabel}</CardDescription>
              <div className="flex items-center justify-between mt-1">
                <span className="font-semibold text-lg">{shop.name}</span>
                <Badge
                  variant={
                    shop.status === "ACTIVE"
                      ? "default"
                      : shop.status === "PENDING_REVIEW"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {shop.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Link
                href="/dashboard/shop"
                className={buttonVariants({
                  variant: "link",
                  size: "sm",
                  className: "px-0 h-auto text-xs",
                })}
              >
                {t.overview.manageShop} <ArrowRightIcon className="size-3 ml-1" />
              </Link>
            </CardContent>
          </Card>

          <Card className="border shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">{t.overview.totalProducts}</CardDescription>
              <CardTitle className="text-2xl font-bold">{products.length}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Link
                href="/dashboard/products"
                className={buttonVariants({
                  variant: "link",
                  size: "sm",
                  className: "px-0 h-auto text-xs",
                })}
              >
                {t.overview.manageProducts} <ArrowRightIcon className="size-3 ml-1" />
              </Link>
            </CardContent>
          </Card>

          <Card className="border shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">{t.overview.publishedProducts}</CardDescription>
              <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {publishedCount}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <span className="text-xs text-muted-foreground">Visible on marketplace</span>
            </CardContent>
          </Card>

          <Card className="border shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">{t.overview.draftProducts}</CardDescription>
              <CardTitle className="text-2xl font-bold text-muted-foreground">
                {draftCount}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <span className="text-xs text-muted-foreground">Unpublished drafts</span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Action Links */}
      {shop && (
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/products" className={buttonVariants({ className: "gap-1.5" })}>
            <PlusIcon className="size-4" />
            {t.merchantProducts.addProduct}
          </Link>
          <Link
            href="/dashboard/shop"
            className={buttonVariants({ variant: "outline", className: "gap-1.5" })}
          >
            <StoreIcon className="size-4" />
            {t.merchantShop.title}
          </Link>
          {shop.status === "ACTIVE" && (
            <Link
              href={`/shops/${shop.slug}`}
              target="_blank"
              className={buttonVariants({ variant: "ghost", className: "gap-1.5" })}
            >
              <StoreIcon className="size-4" />
              {t.overview.viewPublicStore}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
