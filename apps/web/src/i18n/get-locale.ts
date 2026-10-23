import { cache } from "react";
import { cookies } from "next/headers";

import { defaultLocale, isLocale, type Locale } from "./locale";

export const getLocale = cache(async (): Promise<Locale> => {
  const cookieStore = await cookies();
  const value = cookieStore.get("locale")?.value;
  return isLocale(value) ? value : defaultLocale;
});
