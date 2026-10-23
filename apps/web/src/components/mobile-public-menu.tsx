"use client";

import Link from "next/link";
import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDictionary } from "@/i18n/dictionary-provider";

export function MobilePublicMenu() {
  const t = useDictionary();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-full sm:hidden"
            aria-label={t.mobileMenu.open}
          />
        }
      >
        <MenuIcon aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 sm:hidden">
        <DropdownMenuItem render={<Link href="/" />}>{t.nav.browse}</DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard/shop" />}>{t.nav.sell}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/about" />}>{t.nav.about}</DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/contact" />}>{t.nav.contact}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/login" />}>{t.nav.login}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
