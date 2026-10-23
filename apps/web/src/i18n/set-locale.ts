"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { isLocale } from "./locale";

export async function setLocale(locale: string): Promise<void> {
  if (!isLocale(locale)) return;
  (await cookies()).set("locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
}
