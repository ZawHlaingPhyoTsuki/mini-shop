export function errorMessages(errors: unknown): string[] {
  if (!Array.isArray(errors)) return [];
  const messages = errors.map((error) =>
    typeof error === "string" ? error : (error as { message?: unknown } | null)?.message,
  );
  return messages.filter(
    (message): message is string => typeof message === "string" && message.length > 0,
  );
}

export function toOptional(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}
