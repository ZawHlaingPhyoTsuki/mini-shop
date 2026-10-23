import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { ArrowUpRight, Inbox, Mail, Store } from "lucide-react";
import { FacebookIcon } from "@/components/icons/facebook-icon";

import { PageHeader } from "@/components/page-header";
import { PublicFooter } from "@/components/public-footer";
import { buttonVariants } from "@/components/ui/button";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.contact.metaTitle, description: t.contact.metaDescription };
}

// Owner fills in real channels before launch. Empty values render an honest
// fallback instead of a fabricated address.
const CONTACT = {
  email: "",
  facebook: "",
};

const cardClass =
  "group flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md";

export default async function ContactPage() {
  const t = await getDictionary();
  const hasChannel = CONTACT.email !== "" || CONTACT.facebook !== "";
  const stripColon = (label: string) => label.replace(/[:：]\s*$/, "");

  return (
    <>
      <PageHeader title={t.contact.title}>{t.contact.intro}</PageHeader>

      <div className="mx-auto grid max-w-3xl gap-4 px-4 py-10 sm:py-14">
        {hasChannel ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {CONTACT.email ? (
              <a href={`mailto:${CONTACT.email}`} className={cardClass}>
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                  <Mail className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-muted-foreground">
                    {stripColon(t.contact.emailLabel)}
                  </span>
                  <span className="block truncate font-medium">{CONTACT.email}</span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </a>
            ) : null}
            {CONTACT.facebook ? (
              <a
                href={CONTACT.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClass}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                  <FacebookIcon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-muted-foreground">
                    {stripColon(t.contact.facebookLabel)}
                  </span>
                  <span className="block truncate font-medium">{t.brand}</span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </a>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 p-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
              <Inbox className="size-5" aria-hidden />
            </span>
            <p className="leading-loose text-muted-foreground">{t.contact.inboxMissing}</p>
          </div>
        )}

        <div className="flex justify-center pt-4">
          <Link
            href={"/" as Route}
            className={buttonVariants({
              size: "lg",
              className: "h-12 gap-2 rounded-full px-7 font-semibold shadow-md shadow-primary/25",
            })}
          >
            <Store className="size-5" aria-hidden />
            {t.nav.browse}
          </Link>
        </div>
      </div>

      <PublicFooter />
    </>
  );
}
