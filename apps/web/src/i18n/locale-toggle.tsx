"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { cn } from "cn";

import { setLocale } from "./set-locale";
import { useDictionary } from "./dictionary-provider";
import type { Locale } from "./locale";

export function LocaleToggle({ locale, className }: { locale: Locale; className?: string }) {
  const router = useRouter();
  const t = useDictionary();
  const [pending, startTransition] = useTransition();

  return (
    <div
      role="group"
      aria-label={t.localeToggle.label}
      className={cn("inline-flex h-8 items-center rounded-full border p-0.5 text-xs", className)}
    >
      {(
        [
          { value: "my", label: t.localeToggle.myanmar },
          { value: "en", label: t.localeToggle.english },
        ] as const
      ).map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={pending}
          aria-pressed={locale === option.value}
          onClick={() =>
            startTransition(async () => {
              await setLocale(option.value);
              router.refresh();
            })
          }
          className={cn(
            "rounded-full px-2.5 py-1 font-medium transition-colors disabled:opacity-50",
            locale === option.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
