import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { LocaleToggle } from "@/i18n/locale-toggle";

export async function SiteHeader() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4 data-vertical:self-auto" />
        <h1 className="text-base font-medium">{t.dashboard.directoryDesk}</h1>
        <div className="ml-auto">
          <LocaleToggle locale={locale} />
        </div>
      </div>
    </header>
  );
}
