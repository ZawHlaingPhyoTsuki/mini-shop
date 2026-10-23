export const locales = ["my", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "my";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "my" || value === "en";
}
