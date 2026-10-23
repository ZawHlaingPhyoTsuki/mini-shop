import type { Locale } from "@/i18n/locale";

export function formatRelativeUpdated(updatedAt: string, locale: Locale): string {
  const elapsedSeconds = (Date.now() - new Date(updatedAt).getTime()) / 1000;
  const units = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ] as const;
  const [unit, seconds] = units.find(([, value]) => Math.abs(elapsedSeconds) >= value) ?? [
    "second",
    1,
  ];
  return new Intl.RelativeTimeFormat(locale === "my" ? "my" : "en", {
    numeric: "auto",
  }).format(-Math.round(elapsedSeconds / seconds), unit);
}
