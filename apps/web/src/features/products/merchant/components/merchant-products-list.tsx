"use client";

import { useState } from "react";
import {
  ArchiveIcon,
  FileEditIcon,
  PackageIcon,
  PlusIcon,
  SearchIcon,
  UploadIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useDictionary } from "@/i18n/dictionary-provider";

import { setProductStatusAction } from "../../products-actions";
import { MerchantProductForm } from "./merchant-product-form";
import type { Product, ProductStatus } from "../../types/product";
import type { Shop } from "@/features/shops/types/shop";
import type { Category } from "@/features/categories/types/category";

export function MerchantProductsList({
  initialProducts,
  shop,
  categories,
}: {
  initialProducts: Product[];
  shop: Shop | null;
  categories: Category[];
}) {
  const t = useDictionary();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ProductStatus>("ALL");
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);

  const isShopActive = shop?.status === "ACTIVE";

  const filtered = products.filter((prod) => {
    const matchesStatus = statusFilter === "ALL" || prod.status === statusFilter;
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      prod.nameEn.toLowerCase().includes(term) ||
      (prod.nameMy && prod.nameMy.toLowerCase().includes(term)) ||
      (prod.sku && prod.sku.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  });

  async function handleStatusChange(
    productId: string,
    newStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED",
  ) {
    setActionError(null);
    setBusyProductId(productId);
    try {
      const updated = await setProductStatusAction(productId, newStatus);
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updated } : p)));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t.merchantProducts.errorUpdate);
    } finally {
      setBusyProductId(null);
    }
  }

  function handleProductSaved(saved: Product) {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    setIsCreating(false);
    setEditingProduct(null);
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {t.merchantProducts.kicker}
          </p>
          <h1 className="text-2xl font-bold tracking-tight mt-0.5">{t.merchantProducts.title}</h1>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setIsCreating(true);
          }}
          className="gap-1.5 self-start sm:self-auto"
        >
          <PlusIcon className="size-4" />
          {t.merchantProducts.addProduct}
        </Button>
      </div>

      {actionError && (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
        >
          {actionError}
        </div>
      )}

      {!isShopActive && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
          <p className="font-semibold text-xs uppercase tracking-wide">Notice</p>
          <p className="mt-0.5 text-xs">{t.merchantProducts.shopNotActiveTooltip}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={t.merchantProducts.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"] as const).map((filter) => (
            <Button
              key={filter}
              variant={statusFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(filter)}
            >
              {filter === "ALL" ? "All" : filter.charAt(0) + filter.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Product List */}
      {filtered.length === 0 ? (
        <Empty className="border border-dashed py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageIcon />
            </EmptyMedia>
            <EmptyTitle>
              {searchTerm ? t.merchantProducts.noMatchTitle : t.merchantProducts.emptyTitle}
            </EmptyTitle>
            <EmptyDescription>
              {searchTerm ? t.merchantProducts.noMatchBody : t.merchantProducts.emptyBody}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-3">
          {filtered.map((prod) => {
            const isBusy = busyProductId === prod.id;
            return (
              <Card key={prod.id} className="border shadow-xs">
                <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
                  <div className="grid gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-base">{prod.nameEn}</span>
                      {prod.nameMy && (
                        <span className="text-xs text-muted-foreground">({prod.nameMy})</span>
                      )}
                      <ProductStatusBadge status={prod.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-0.5">
                      <span>
                        <span className="font-medium text-foreground">
                          K {prod.priceMMK.toLocaleString()}
                        </span>
                        {prod.priceTHB && (
                          <span className="ml-1 text-muted-foreground">
                            (฿ {prod.priceTHB.toLocaleString()})
                          </span>
                        )}
                      </span>
                      <span>
                        Category:{" "}
                        <span className="text-foreground">
                          {prod.category?.nameEn ?? t.merchantProducts.noCategory}
                        </span>
                      </span>
                      <span>
                        Stock:{" "}
                        <span className="text-foreground">
                          {prod.stockQuantity !== null
                            ? prod.stockQuantity
                            : t.merchantProducts.untrackedStock}
                        </span>
                      </span>
                      {prod.sku && (
                        <span>
                          SKU: <span className="font-mono text-foreground">{prod.sku}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {prod.status === "DRAFT" && (
                      <Button
                        size="sm"
                        disabled={!isShopActive || isBusy}
                        onClick={() => handleStatusChange(prod.id, "PUBLISHED")}
                        title={!isShopActive ? t.merchantProducts.shopNotActiveTooltip : undefined}
                        className="gap-1.5"
                      >
                        <UploadIcon className="size-3.5" />
                        {t.merchantProducts.publishAction}
                      </Button>
                    )}

                    {prod.status === "PUBLISHED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isBusy}
                        onClick={() => handleStatusChange(prod.id, "DRAFT")}
                        className="gap-1.5"
                      >
                        {t.merchantProducts.unpublishAction}
                      </Button>
                    )}

                    {prod.status !== "ARCHIVED" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isBusy}
                        onClick={() => handleStatusChange(prod.id, "ARCHIVED")}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ArchiveIcon className="size-3.5" />
                        <span className="sr-only sm:not-sr-only sm:ml-1">
                          {t.merchantProducts.archiveAction}
                        </span>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingProduct(prod)}
                      className="gap-1.5"
                    >
                      <FileEditIcon className="size-3.5" />
                      {t.merchantProducts.editAction}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Product Form Dialog (Create / Edit) */}
      <Dialog
        open={isCreating || Boolean(editingProduct)}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setEditingProduct(null);
          }
        }}
      >
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct
                ? t.merchantProductForm.formTitleEdit
                : t.merchantProductForm.formTitleNew}
            </DialogTitle>
            <DialogDescription>{t.merchantProductForm.formDescription}</DialogDescription>
          </DialogHeader>
          <MerchantProductForm
            product={editingProduct}
            categories={categories}
            onSaved={handleProductSaved}
            onCancel={() => {
              setIsCreating(false);
              setEditingProduct(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const styles: Record<
    ProductStatus,
    { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
  > = {
    PUBLISHED: { variant: "default", label: "Published" },
    DRAFT: { variant: "secondary", label: "Draft" },
    ARCHIVED: { variant: "outline", label: "Archived" },
    HIDDEN: { variant: "destructive", label: "Hidden" },
  };

  const current = styles[status];
  return <Badge variant={current.variant}>{current.label}</Badge>;
}
