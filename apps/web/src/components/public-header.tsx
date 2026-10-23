import Link from "next/link";
import { StoreIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { PublicBrandLink } from "@/components/public-brand-link";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { LocaleToggle } from "@/i18n/locale-toggle";
import { MobilePublicMenu } from "./mobile-public-menu";

const linkClassName =
  "inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

export async function PublicHeader() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-3 sm:px-4"
        aria-label={t.nav.main}
      >
        <div className="mr-0 shrink-0 sm:mr-4">
          <PublicBrandLink label={t.brand} />
        </div>

        <div className="hidden items-center gap-1 sm:flex">
          <Link href="/" className={linkClassName}>
            {t.nav.browse}
          </Link>
          <Link href="/about" className={linkClassName}>
            {t.nav.about}
          </Link>
          <Link href="/contact" className={linkClassName}>
            {t.nav.contact}
          </Link>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <LocaleToggle locale={locale} />
          <Link href="/login" className={`${linkClassName} hidden sm:inline-flex`}>
            {t.nav.login}
          </Link>
          <Link
            href="/dashboard/shop"
            className={buttonVariants({
              size: "sm",
              className:
                "h-10 gap-1.5 rounded-full px-3 font-semibold shadow-md shadow-primary/20 sm:px-4",
            })}
          >
            <StoreIcon className="size-4" aria-hidden />
            {t.nav.sell}
          </Link>
          <MobilePublicMenu />
        </div>
      </nav>
    </header>
  );
}
