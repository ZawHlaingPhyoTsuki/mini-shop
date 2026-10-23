import Link from "next/link";
import { Store } from "lucide-react";

import { getDictionary } from "@/i18n/get-dictionary";

const linkClass = "transition-colors hover:text-foreground";

export async function PublicFooter() {
  const t = await getDictionary();
  return (
    <footer className="mt-8 border-t border-border/60 bg-muted/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xs space-y-2">
          <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold">
            <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
              <Store className="size-3.5" aria-hidden />
            </span>
            {t.brand}
          </Link>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t.landing.metaDescription}
          </p>
        </div>

        <nav
          className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:gap-6"
          aria-label={t.nav.footer}
        >
          <Link href="/" className={linkClass}>
            {t.nav.browse}
          </Link>
          <Link href="/dashboard/shop" className={linkClass}>
            {t.nav.sell}
          </Link>
          <Link href="/about" className={linkClass}>
            {t.nav.about}
          </Link>
          <Link href="/contact" className={linkClass}>
            {t.nav.contact}
          </Link>
          <Link href="/login" className={linkClass}>
            {t.nav.login}
          </Link>
        </nav>
      </div>
      <div className="border-t border-border/60">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t.brand}
        </p>
      </div>
    </footer>
  );
}
