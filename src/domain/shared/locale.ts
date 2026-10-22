import { z } from "zod";

export const LOCALES = ["en", "my"] as const;

export const localeSchema = z.enum(LOCALES);

export type Locale = z.infer<typeof localeSchema>;

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALIZED_NAME_MAX_LENGTH = 120;

const localizedNameSchema = z.string().trim().min(1).max(LOCALIZED_NAME_MAX_LENGTH);

export const localizedNamesSchema = z
  .partialRecord(localeSchema, localizedNameSchema)
  .refine((names) => Boolean(names[DEFAULT_LOCALE]), {
    message: "English name is required",
    path: [DEFAULT_LOCALE],
  });

export type LocalizedNames = z.infer<typeof localizedNamesSchema>;

/**
 * Returns the name for the requested locale, falling back to English.
 *
 * @param names Localized name map stored in Postgres.
 * @param locale Requested locale.
 * @returns The best available localized name.
 */
export function localizedName(names: LocalizedNames, locale: Locale = DEFAULT_LOCALE) {
  return names[locale] ?? names[DEFAULT_LOCALE]!;
}
