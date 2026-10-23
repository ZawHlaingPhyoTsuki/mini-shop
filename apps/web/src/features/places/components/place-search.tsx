"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2, Search, X } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "cn";
import { useDictionary } from "@/i18n/dictionary-provider";

export function PlaceSearch({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initial = searchParams.get("search") ?? "";
  const t = useDictionary();
  const [value, setValue] = useState(initial);
  const [isPending, startTransition] = useTransition();

  // Keep input in sync with back/forward navigation.
  useEffect(() => {
    setValue(searchParams.get("search") ?? "");
  }, [searchParams]);

  // Debounced URL update. Search is server-filtered and shareable.
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();
      if (trimmed) params.set("search", trimmed);
      else params.delete("search");
      const next = params.toString();
      if (next !== searchParams.toString()) {
        startTransition(() => {
          router.replace((next ? `${pathname}?${next}` : pathname) as Route, { scroll: false });
        });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value, pathname, router, searchParams]);

  return (
    <InputGroup className={cn("h-10 rounded-full border-border/80 bg-card shadow-sm", className)}>
      <InputGroupInput
        placeholder={t.search.placeholder}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="[&::-webkit-search-cancel-button]:hidden"
      />
      <InputGroupAddon align="inline-end">
        {isPending ? (
          <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
        ) : value ? (
          <InputGroupButton size="icon-xs" aria-label={t.chips.all} onClick={() => setValue("")}>
            <X className="size-4" aria-hidden />
          </InputGroupButton>
        ) : (
          <Search className="size-4 text-muted-foreground" aria-hidden />
        )}
      </InputGroupAddon>
    </InputGroup>
  );
}
