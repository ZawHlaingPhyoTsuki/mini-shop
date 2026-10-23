// Shared place-slug generator (mirrored in apps/server/src/places/place-slug.ts).
// Generates URL slugs from nameEn; falls back to "place-" + short random id.

const MAX_BASE_LENGTH = 60;

// UUID hyphens start at index 8, so the first 6 chars are always alphanumerics.
function randomShortId(): string {
  return crypto.randomUUID().slice(0, 6);
}

/** Lowercase ASCII hyphenated slug base, or null when nothing usable remains. */
export function slugifyPlaceName(nameEn: string): string | null {
  const ascii = nameEn
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const hyphenated = ascii.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (!hyphenated) return null;
  const truncated = hyphenated.slice(0, MAX_BASE_LENGTH).replace(/-+$/g, "");
  return truncated || null;
}

function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let counter = 2;
  while (taken.has(`${base}-${counter}`)) counter += 1;
  return `${base}-${counter}`;
}

export function buildPlaceSlug(options: {
  nameEn?: string | null;
  taken?: Set<string> | string[];
  fallbackId?: string;
}): string {
  const taken = new Set(options.taken ?? []);
  const base = options.nameEn?.trim() ? slugifyPlaceName(options.nameEn) : null;
  if (base) return uniqueSlug(base, taken);
  return uniqueSlug(`place-${options.fallbackId ?? randomShortId()}`, taken);
}
