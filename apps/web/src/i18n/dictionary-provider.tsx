"use client";

import { createContext, useContext } from "react";

import type { Dictionary } from "./get-dictionary";
import { en } from "./dictionaries/en";
import { my } from "./dictionaries/my";
import type { Locale } from "./locale";

const DictionaryContext = createContext<Dictionary | null>(null);
const LocaleContext = createContext<Locale>("my");

export function DictionaryProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const dictionary = locale === "my" ? my : en;

  return (
    <DictionaryContext.Provider value={dictionary}>
      <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
    </DictionaryContext.Provider>
  );
}

export function useDictionary(): Dictionary {
  const dictionary = useContext(DictionaryContext);
  if (!dictionary) throw new Error("useDictionary must be used within DictionaryProvider");
  return dictionary;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}
