"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PackageIcon, SearchIcon, StoreIcon, TagIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/i18n/dictionary-provider";
import type { Product } from "../../types/product";
import type { Category } from "@/features/categories/types/category";

export function MarketplaceCatalog({
  initialProducts,
  categories,
  selectedCategorySlug,
}: {
  initialProducts: Product[];
  categories: Category[];
  selectedCategorySlug?: string;
}) {
  const t = useDictionary();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>(
    selectedCategorySlug ?? "ALL",
  );

  const filtered = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchesCategory =
        activeCategorySlug === "ALL" || p.category?.slug === activeCategorySlug;
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        p.nameEn.toLowerCase().includes(term) ||
        (p.nameMy && p.nameMy.toLowerCase().includes(term)) ||
        (p.descriptionEn && p.descriptionEn.toLowerCase().includes(term)) ||
        (p.descriptionMy && p.descriptionMy.toLowerCase().includes(term)) ||
        (p.shop && p.shop.name.toLowerCase().includes(term));

      return matchesCategory && matchesSearch;
    });
  }, [initialProducts, activeCategorySlug, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative max-w-xl mx-auto">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t.landing.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-11 pl-10 pr-4 text-sm rounded-full shadow-xs bg-background border-border/80"
          aria-label={t.landing.searchLabel}
        />
      </div>

      {/* Categories Bar */}
      {categories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <Button
            variant={activeCategorySlug === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategorySlug("ALL")}
            className="rounded-full shrink-0 text-xs h-8 px-3.5"
          >
            {t.landing.allCategories}
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategorySlug === cat.slug ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategorySlug(cat.slug)}
              className="rounded-full shrink-0 text-xs h-8 px-3.5"
            >
              {cat.nameEn}
            </Button>
          ))}
        </div>
      )}

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <Empty className="border border-dashed py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageIcon />
            </EmptyMedia>
            <EmptyTitle>{t.landing.emptyTitle}</EmptyTitle>
            <EmptyDescription>{t.landing.emptyBody}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((prod) => (
            <Link
              key={prod.id}
              href={`/products/${prod.slug}`}
              className="group block rounded-xl border border-border/70 bg-card p-3 shadow-xs transition hover:border-primary/40 hover:shadow-sm"
            >
              {/* Product Visual Placeholder or Image */}
              <div className="aspect-square w-full rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground group-hover:bg-muted/80 transition mb-3">
                <PackageIcon className="size-8 opacity-40 group-hover:scale-105 transition transform" />
              </div>

              {/* Product Details */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <TagIcon className="size-3" />
                  <span className="truncate">{prod.category?.nameEn ?? "Marketplace"}</span>
                </div>

                <h3 className="font-semibold text-sm line-clamp-1 text-foreground group-hover:text-primary transition-colors">
                  {prod.nameEn}
                </h3>
                {prod.nameMy && (
                  <p className="text-xs text-muted-foreground line-clamp-1 font-normal">
                    {prod.nameMy}
                  </p>
                )}

                {/* Pricing in MMK and THB */}
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

                {/* Shop Reference and COD */}
                {prod.shop && (
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1 truncate font-medium">
                      <StoreIcon className="size-3 shrink-0" />
                      <span className="truncate">{prod.shop.name}</span>
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 uppercase tracking-wider shrink-0 font-normal"
                    >
                      COD
                    </Badge>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
