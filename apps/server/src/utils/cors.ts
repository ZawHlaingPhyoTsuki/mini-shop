export function parseCorsOrigins(corsOrigin: string): string[] {
  if (!corsOrigin) return [];
  return corsOrigin
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);
}
