import { cache } from "react";

import { getLocale } from "./get-locale";
import { en, type Dictionary } from "./dictionaries/en";
import { my } from "./dictionaries/my";

export type { Dictionary };

export const getDictionary = cache(async (): Promise<Dictionary> => {
  const locale = await getLocale();
  return locale === "my" ? my : en;
});
