import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, MessageSquareWarning, ShieldCheck, Store } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { PublicFooter } from "@/components/public-footer";
import { buttonVariants } from "@/components/ui/button";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.about.metaTitle, description: t.about.metaDescription };
}

export default async function AboutPage() {
  const t = await getDictionary();
  const paragraphs = [
    { Icon: Store, text: t.about.p1 },
    { Icon: ShieldCheck, text: t.about.p2 },
  ];

  return (
    <>
      <PageHeader title={t.about.title} />

      <div className="mx-auto grid max-w-3xl gap-4 px-4 py-10 sm:py-14">
        {paragraphs.map(({ Icon, text }) => (
          <div
            key={text}
            className="flex gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
              <Icon className="size-5" aria-hidden />
            </span>
            <p className="text-base leading-loose">{text}</p>
          </div>
        ))}

        <Link
          href={"/contact" as Route}
          className="group flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/10 p-5 transition-colors hover:bg-primary/15 sm:p-6"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <MessageSquareWarning className="size-5" aria-hidden />
          </span>
          <span className="flex-1 text-base leading-loose">
            {t.about.ctaPre}{" "}
            <span className="font-semibold text-primary underline underline-offset-4">
              {t.about.ctaLink}
            </span>
          </span>
          <ArrowRight
            className="size-5 shrink-0 text-primary transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </Link>

        <div className="flex justify-center pt-4">
          <Link
            href={"/map" as Route}
            className={buttonVariants({
              size: "lg",
              className: "h-12 gap-2 rounded-full px-7 font-semibold shadow-md shadow-primary/25",
            })}
          >
            <MapPin className="size-5" aria-hidden />
            {t.landing.browseMap}
          </Link>
        </div>
      </div>

      <PublicFooter />
    </>
  );
}
