import { PublicBrandLink } from "@/components/public-brand-link";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { LocaleToggle } from "@/i18n/locale-toggle";

export default async function MapLayout({ children }: { children: React.ReactNode }) {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <div className="relative h-svh">
      {children}
      <div className="absolute z-30 hidden items-center gap-1 rounded-full border border-border/70 bg-card/95 p-1 shadow-md backdrop-blur md:top-4 md:right-16 md:flex">
        <PublicBrandLink compact label={t.brand} />
        <LocaleToggle locale={locale} />
      </div>
    </div>
  );
}
