"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type * as React from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { useDictionary } from "@/i18n/dictionary-provider";

export function LandingSearch() {
  const router = useRouter();
  const t = useDictionary();
  const [value, setValue] = useState("");

  function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    router.push((trimmed ? `/map?search=${encodeURIComponent(trimmed)}` : "/map") as Route);
  }

  return (
    <form onSubmit={submit} role="search" className="flex w-full min-w-0 gap-2">
      <InputGroup className="h-12 min-w-0 flex-1 rounded-full border-border/80 bg-card shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-primary/25">
        <InputGroupInput
          placeholder={t.landing.searchPlaceholder}
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-label={t.landing.searchLabel}
          className="h-full"
        />
        <InputGroupAddon align="inline-end">
          <Search className="size-4 text-muted-foreground" />
        </InputGroupAddon>
      </InputGroup>
      <Button
        type="submit"
        size="lg"
        variant="secondary"
        className="h-12 shrink-0 rounded-full px-6"
      >
        {t.landing.searchButton}
      </Button>
    </form>
  );
}
