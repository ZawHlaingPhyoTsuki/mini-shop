import { headers } from "next/headers";

export function serverUrl() {
  return (process.env.SERVER_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export async function getRequestHeaders() {
  const requestHeaders = new Headers(await headers());
  requestHeaders.delete("content-length");
  requestHeaders.delete("content-encoding");
  requestHeaders.set("Content-Type", "application/json");
  return requestHeaders;
}
