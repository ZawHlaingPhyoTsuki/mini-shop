"use client";

import Link from "next/link";
import {
  CheckSquareIcon,
  House as IconHouse,
  LayoutDashboardIcon,
  PackageIcon,
  Settings as IconSettings,
  StoreIcon,
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

  const isAdmin = user?.role === "admin";

  const navMain = [
    { title: t.dashboard.overview, url: "/dashboard", icon: <LayoutDashboardIcon /> },
    { title: t.dashboard.myShop, url: "/dashboard/shop", icon: <StoreIcon /> },
    { title: t.dashboard.products, url: "/dashboard/products", icon: <PackageIcon /> },
    ...(isAdmin
      ? [
          {
            title: t.dashboard.adminShops,
            url: "/dashboard/admin/shops",
            icon: <CheckSquareIcon />,
          },
          { title: t.dashboard.categories, url: "/dashboard/categories", icon: <TagIcon /> },
        ]
      : []),
  ];

  const navSecondary = [
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
  ];

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
              <StoreIcon className="size-5! text-primary" />
              <span className="text-base font-bold tracking-tight">{t.brand}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
