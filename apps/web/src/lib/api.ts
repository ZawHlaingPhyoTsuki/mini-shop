import "server-only";

import { getRequestHeaders, serverUrl } from "@/lib/server-url";

export class ApiTransportError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function errorMessage(response: Response) {
  const text = await response.text();
  try {
    const body = JSON.parse(text) as { message?: unknown };
    if (typeof body.message === "string") return body.message;
    if (Array.isArray(body.message)) return body.message.join(", ");
  } catch {
    // not JSON — fall through to the raw body
  }
  return text || `Request failed with status ${response.status}`;
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
  authenticated = false,
): Promise<T> {
  const response = await fetch(`${serverUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: authenticated ? await getRequestHeaders() : init?.headers,
  });
  if (!response.ok) {
    throw new ApiTransportError(await errorMessage(response), response.status);
  }
  return (await response.json()) as T;
}
