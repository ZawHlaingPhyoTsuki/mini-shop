"use client";

import { Toaster } from "@/components/ui/sonner";
import { DictionaryProvider } from "@/i18n/dictionary-provider";
import type { Locale } from "@/i18n/locale";

import { ThemeProvider } from "./theme-provider";

export default function Providers({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <DictionaryProvider locale={locale}>{children}</DictionaryProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
