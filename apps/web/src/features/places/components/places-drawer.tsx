"use client";

import type { ReactNode } from "react";
import { PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import type { Category } from "@/features/categories/types/category";
import { useDictionary } from "@/i18n/dictionary-provider";

import type { Place } from "../types/place";
import { PlaceFilterChips } from "./place-filter-chips";
import { PlaceList } from "./place-list";

export type DrawerState = "peek" | "expanded";

export { DRAWER_SNAP_POINTS };

const DRAWER_SNAP_POINTS = { peek: 0.3, expanded: 0.85 } as const;

const VARIANT_CLASSES = {
  bottom: {
    trigger: "absolute top-2 left-2 z-20 size-10 rounded-full bg-card shadow-md",
    triggerIcon: "size-4",
    content: "h-[85dvh] md:hidden",
    chips: "shrink-0 px-3 pt-1 pb-2",
    list: "min-h-0 flex-1 overflow-y-auto px-3 pb-4",
  },
  side: {
    trigger: "absolute top-4 left-4 z-20 hidden size-10 rounded-full bg-card shadow-md md:flex",
    triggerIcon: "size-5",
    content: "max-md:hidden",
    chips: "shrink-0 px-4 pt-3",
    list: "min-h-0 flex-1 overflow-y-auto p-4",
  },
} as const;

export function PlacesDrawer({
  places,
  categories,
  selectedPlaceId,
  onSelect,
  open,
  onOpenChange,
  variant,
  snapPoint,
  onSnapPointChange,
  header,
}: {
  places: Place[];
  categories: Category[];
  selectedPlaceId: string | null;
  onSelect: (id: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: "bottom" | "side";
  snapPoint?: number | string | null;
  onSnapPointChange?: (snapPoint: number | string | null) => void;
  header?: ReactNode;
}) {
  const classes = VARIANT_CLASSES[variant];
  const t = useDictionary();

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      modal={false}
      disablePointerDismissal
      showSwipeHandle={variant === "bottom"}
      swipeDirection={variant === "bottom" ? "down" : "left"}
      snapPoints={
        variant === "bottom" ? [DRAWER_SNAP_POINTS.peek, DRAWER_SNAP_POINTS.expanded] : undefined
      }
      snapPoint={snapPoint}
      onSnapPointChange={onSnapPointChange}
    >
      <DrawerTrigger
        render={
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label={t.drawer.toggle}
            className={classes.trigger}
          />
        }
      >
        <PanelLeftOpen className={classes.triggerIcon} aria-hidden />
      </DrawerTrigger>
      <DrawerContent aria-label={t.drawer.title} initialFocus={false} className={classes.content}>
        <DrawerTitle className="sr-only">{t.drawer.title}</DrawerTitle>
        {header}
        <div className={classes.chips}>
          <PlaceFilterChips categories={categories} />
        </div>
        <div className={classes.list}>
          <PlaceList places={places} selectedPlaceId={selectedPlaceId} onSelect={onSelect} />
        </div>
        <DrawerFooter>
          <DrawerClose render={<Button>{t.drawer.close}</Button>} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
