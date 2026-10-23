"use client";

import Link from "next/link";
import {
  BookOpenIcon,
  House as IconHouse,
  LayoutDashboardIcon,
  MapPinIcon,
  MapPinnedIcon,
  Search as IconSearch,
  Settings as IconSettings,
  TagIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { NavSecondary } from "./nav-secondary";
import { useDictionary } from "@/i18n/dictionary-provider";
import type { Session } from "@/features/auth/types/session";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: Session["user"] | null;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const t = useDictionary();
  const { isMobile, setOpenMobile } = useSidebar();
  const data = {
    navMain: [
      { title: t.dashboard.overview, url: "/dashboard", icon: <LayoutDashboardIcon /> },
      { title: t.dashboard.places, url: "/dashboard/places", icon: <MapPinIcon /> },
      { title: t.dashboard.categories, url: "/dashboard/categories", icon: <TagIcon /> },
      { title: t.dashboard.areas, url: "/dashboard/areas", icon: <MapPinnedIcon /> },
    ],
    navSecondary: [
      {
        title: t.dashboard.settings,
        url: "/dashboard/settings",
        icon: IconSettings,
      },
      {
        title: t.dashboard.goToWebsite,
        url: "/",
        icon: IconHouse,
      },
      {
        title: t.dashboard.searchLink,
        url: "#",
        icon: IconSearch,
      },
    ],
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={
                <Link
                  href="/dashboard"
                  onClick={() => {
                    if (isMobile) setOpenMobile(false);
                  }}
                />
              }
            >
              <BookOpenIcon className="size-5!" />
              <span className="text-base font-semibold">{t.brand}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
