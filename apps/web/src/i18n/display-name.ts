import type { Locale } from "./locale";

export function displayName(
  nameMy: string | null | undefined,
  nameEn: string | null | undefined,
  locale: Locale,
): string {
  const primary = locale === "my" ? nameMy : nameEn;
  const fallback = locale === "my" ? nameEn : nameMy;
  return primary || fallback || "";
}
