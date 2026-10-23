"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, UtensilsCrossed } from "lucide-react";

import type { Category } from "@/features/categories/types/category";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import { useDictionary, useLocale } from "@/i18n/dictionary-provider";
import { displayName } from "@/i18n/display-name";

export function PlaceFilterChips({
  categories,
  className,
}: {
  categories: Category[];
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("category");
  const t = useDictionary();
  const locale = useLocale();

  function select(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("category", slug);
    else params.delete("category");
    const query = params.toString();
    router.push((query ? `${pathname}?${query}` : pathname) as Route);
  }

  return (
    <div
      role="group"
      aria-label={t.chips.filterLabel}
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <Button
        size="sm"
        variant={active == null ? "secondary" : "outline"}
        aria-pressed={active == null}
        onClick={() => select(null)}
        className="shrink-0"
      >
        <LayoutGrid aria-hidden />
        {t.chips.all}
      </Button>
      {categories.map((category) => {
        const isActive = active === category.slug;
        return (
          <Button
            key={category.id}
            size="sm"
            variant={isActive ? "secondary" : "outline"}
            aria-pressed={isActive}
            onClick={() => select(isActive ? null : category.slug)}
            className="shrink-0"
          >
            <UtensilsCrossed aria-hidden />
            {displayName(category.nameMy, category.nameEn, locale)}
          </Button>
        );
      })}
    </div>
  );
}
