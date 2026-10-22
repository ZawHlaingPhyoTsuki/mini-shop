import { z } from "zod";

import type { Locale } from "./locale";

export const CURRENCIES = ["MMK", "THB"] as const;

export const currencySchema = z.enum(CURRENCIES);

export type Currency = z.infer<typeof currencySchema>;

export const MAX_AMOUNT = 2_147_483_647;

export const amountSchema = z.number().int().nonnegative().max(MAX_AMOUNT);

export const moneySchema = z.object({
  amount: amountSchema,
  currency: currencySchema,
});

export type Money = z.infer<typeof moneySchema>;

/**
 * Formats money without decimals. MMK and THB are both used as whole units.
 *
 * @param money Amount with its explicit currency.
 * @param locale Locale used for grouping and currency placement.
 * @returns A localized currency string.
 */
export function formatMoney(money: Money, locale: Locale = "en") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(money.amount);
}
