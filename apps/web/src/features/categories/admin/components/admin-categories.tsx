"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { TagIcon } from "lucide-react";
import { useDictionary } from "@/i18n/dictionary-provider";

import { deleteCategory } from "../../categories-actions";
import { AdminCategoryForm } from "./admin-category-form";
import type { AdminCategory } from "../../types/category";

export function AdminCategories({ initialCategories }: { initialCategories: AdminCategory[] }) {
  const t = useDictionary();
  const [categories, setCategories] = useState(initialCategories);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  function savedCategory(saved: AdminCategory) {
    setCategories((current) => {
      const exists = current.some((item) => item.id === saved.id);
      return exists
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...current];
    });
    setEditing(null);
    setIsCreating(false);
  }

  async function remove(category: AdminCategory) {
    setError(null);
    setBusy(category.id);
    try {
      await deleteCategory(category.id);
      setCategories((current) => current.filter((item) => item.id !== category.id));
      setDeleting(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : t.adminCategories.errorDelete,
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-1">
          <p className="text-sm text-muted-foreground">{t.adminCategories.kicker}</p>
          <h2 className="text-2xl font-semibold tracking-tight">{t.adminCategories.title}</h2>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setIsCreating(true);
          }}
        >
          {t.adminCategories.addCategory}
        </Button>
      </div>
      <Dialog
        open={isCreating || Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
            setIsCreating(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing
                ? t.adminCategories.editCategory(editing.nameEn || editing.nameMy || editing.slug)
                : t.adminCategories.addCategory}
            </DialogTitle>
            <DialogDescription>{t.adminCategories.sheetDescription}</DialogDescription>
          </DialogHeader>
          <AdminCategoryForm
            key={editing?.id ?? "new"}
            category={editing}
            onSaved={savedCategory}
            onCancel={() => {
              setEditing(null);
              setIsCreating(false);
            }}
          />
        </DialogContent>
      </Dialog>
      {error ? (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
      {categories.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TagIcon />
            </EmptyMedia>
            <EmptyTitle>{t.adminCategories.emptyTitle}</EmptyTitle>
            <EmptyDescription>{t.adminCategories.emptyBody}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ItemGroup>
          {categories.map((category) => (
            <Item
              key={category.id}
              size="sm"
              variant="outline"
              className="bg-card hover:bg-muted/30"
            >
              <ItemContent>
                <ItemTitle>
                  {category.nameEn}
                  {category.nameMy ? (
                    <span className="text-muted-foreground ml-2 font-normal text-xs">
                      ({category.nameMy})
                    </span>
                  ) : null}
                </ItemTitle>
                <ItemDescription>?category={category.slug}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Badge variant="outline" className="tabular-nums">
                  {category.productCount} {t.adminCategories.countUnit(category.productCount)}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setEditing(category);
                  }}
                >
                  {t.adminCategories.edit}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={category.productCount > 0 || busy === category.id}
                  title={category.productCount > 0 ? t.adminCategories.moveBlocked : undefined}
                  onClick={() => setDeleting(category.id)}
                >
                  {busy === category.id ? t.adminCategories.deleting : t.adminCategories.delete}
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      )}
      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.adminCategories.deleteTitle}</DialogTitle>
            <DialogDescription>{t.adminCategories.deleteBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              {t.adminCategories.keepCategory}
            </Button>
            <Button
              variant="destructive"
              disabled={!deleting || busy === deleting}
              onClick={() => {
                const category = categories.find((item) => item.id === deleting);
                if (category) void remove(category);
              }}
            >
              {deleting && busy === deleting
                ? t.adminCategories.deleting
                : t.adminCategories.deleteConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AdminCategoriesSkeleton() {
  return (
    <div
      className="grid gap-2"
      aria-busy="true"
      aria-label={useDictionary().adminCategories.loading}
    >
      {[0, 1, 2].map((item) => (
        <Skeleton key={item} className="h-16 w-full" />
      ))}
    </div>
  );
}
