"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { MapPin } from "lucide-react";

import { useDictionary } from "@/i18n/dictionary-provider";

export function AuthShell({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  const t = useDictionary();
  return (
    <div className="bg-linear-to-b from-primary/10 to-transparent px-4 py-12 sm:py-20">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2 font-heading text-lg font-semibold tracking-tight"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <MapPin className="size-4" aria-hidden />
          </span>
          {t.brand}
        </Link>

        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-lg sm:p-8">
          <h1 className="mb-6 text-center font-heading text-2xl leading-[1.4] font-semibold sm:text-3xl">
            {title}
          </h1>
          {children}
        </div>

        <div className="mt-4 text-center">{footer}</div>
      </div>
    </div>
  );
}

export function FieldError({ errors }: { errors: Array<{ message?: string } | undefined> }) {
  return (
    <>
      {errors.map((error) =>
        error?.message ? (
          <p key={error.message} className="text-sm text-destructive">
            {error.message}
          </p>
        ) : null,
      )}
    </>
  );
}
