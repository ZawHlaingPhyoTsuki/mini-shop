"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import Link from "next/link";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ClockIcon,
  ExternalLinkIcon,
  GlobeIcon,
  PhoneIcon,
  StoreIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { FormTextField } from "@/components/ui/form-text-field";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toOptional } from "@/lib/form";
import { useDictionary } from "@/i18n/dictionary-provider";

import { createShopAction, resubmitMyShopAction, updateMyShopAction } from "../shops-actions";
import { shopFormSchema, type ShopFormValues } from "../shops-schema";
import type { Shop, ShopStatus } from "../types/shop";

export function MerchantShopView({ initialShop }: { initialShop: Shop | null }) {
  const t = useDictionary();
  const [shop, setShop] = useState<Shop | null>(initialShop);
  const [isEditing, setIsEditing] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleResubmit() {
    setActionError(null);
    setIsResubmitting(true);
    try {
      const updated = await resubmitMyShopAction();
      setShop(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t.merchantShop.errorResubmit);
    } finally {
      setIsResubmitting(false);
    }
  }

  function copyStoreUrl() {
    if (!shop) return;
    const url = `${window.location.origin}/shops/${shop.slug}`;
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!shop) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="border shadow-sm">
          <CardHeader className="gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <StoreIcon className="size-5" />
            </div>
            <div>
              <CardTitle className="text-xl">{t.merchantShop.registrationTitle}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {t.merchantShop.registrationSubtitle}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ShopForm onSuccess={(created) => setShop(created)} isNew />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {t.merchantShop.kicker}
          </p>
          <h1 className="text-2xl font-bold tracking-tight mt-0.5">{shop.name}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={shop.status} />
          {shop.status === "ACTIVE" && (
            <Link
              href={`/shops/${shop.slug}`}
              target="_blank"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ExternalLinkIcon className="size-4 mr-1.5" />
              {t.overview.viewPublicStore}
            </Link>
          )}
          {shop.status !== "PENDING_REVIEW" && shop.status !== "CLOSED" && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              {t.merchantProducts.editAction}
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
        >
          {actionError}
        </div>
      )}

      {/* Review Status Banner */}
      {shop.status === "PENDING_REVIEW" && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <ClockIcon className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <CardTitle className="text-base text-amber-900 dark:text-amber-200">
                {t.merchantShop.pendingBannerTitle}
              </CardTitle>
              <CardDescription className="text-amber-800/80 dark:text-amber-300/80 text-sm mt-0.5">
                {t.merchantShop.pendingBannerBody}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {shop.status === "DRAFT" && shop.reviewNote && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="gap-2">
            <div className="flex items-center gap-2">
              <AlertCircleIcon className="size-5 text-destructive shrink-0" />
              <CardTitle className="text-base text-destructive">
                {t.merchantShop.rejectedBannerTitle}
              </CardTitle>
            </div>
            <div className="rounded-md border border-destructive/20 bg-background p-3 text-sm">
              <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-1">
                {t.merchantShop.rejectedBannerBody}
              </p>
              <p className="text-foreground">{shop.reviewNote}</p>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={handleResubmit} disabled={isResubmitting}>
                {isResubmitting ? t.merchantShop.resubmitting : t.merchantShop.resubmitAction}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                {t.merchantShop.saveButton}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {shop.status === "ACTIVE" && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <CardTitle className="text-base text-emerald-950 dark:text-emerald-200">
                  {t.merchantShop.activeBannerTitle}
                </CardTitle>
                <CardDescription className="text-emerald-900/80 dark:text-emerald-300/80 text-sm mt-0.5">
                  {t.merchantShop.activeBannerBody}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">
                {t.merchantShop.publicUrlLabel}
              </span>
              <code className="rounded bg-muted px-2 py-1 text-xs font-mono break-all">
                {typeof window !== "undefined" ? window.location.origin : ""}/shops/{shop.slug}
              </code>
              <Button size="sm" variant="ghost" onClick={copyStoreUrl} className="h-8">
                {copied ? t.merchantShop.linkCopied : t.merchantShop.copyLink}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shop Details Card */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t.merchantShop.title}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="text-xs text-muted-foreground font-medium">
              {t.merchantShop.nameLabel}
            </span>
            <p className="text-sm font-semibold mt-0.5">{shop.name}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">
              {t.merchantShop.slugLabel}
            </span>
            <p className="text-sm font-mono mt-0.5">/shops/{shop.slug}</p>
          </div>
          {shop.contactPhone && (
            <div>
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <PhoneIcon className="size-3" />
                {t.merchantShop.phoneLabel}
              </span>
              <p className="text-sm font-medium mt-0.5">{shop.contactPhone}</p>
            </div>
          )}
          {shop.socialLinks && Object.keys(shop.socialLinks).length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <GlobeIcon className="size-3" />
                {t.publicShop.socialLinks}
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {shop.socialLinks.facebook && (
                  <a
                    href={shop.socialLinks.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary underline underline-offset-2"
                  >
                    Facebook
                  </a>
                )}
                {shop.socialLinks.tiktok && (
                  <a
                    href={shop.socialLinks.tiktok}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary underline underline-offset-2"
                  >
                    TikTok
                  </a>
                )}
              </div>
            </div>
          )}
          {shop.descriptionEn && (
            <div className="sm:col-span-2">
              <span className="text-xs text-muted-foreground font-medium">
                {t.merchantShop.descEnLabel}
              </span>
              <p className="text-sm text-foreground/90 mt-0.5 whitespace-pre-wrap">
                {shop.descriptionEn}
              </p>
            </div>
          )}
          {shop.descriptionMy && (
            <div className="sm:col-span-2">
              <span className="text-xs text-muted-foreground font-medium">
                {t.merchantShop.descMyLabel}
              </span>
              <p className="text-sm text-foreground/90 mt-0.5 whitespace-pre-wrap">
                {shop.descriptionMy}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Shop Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.merchantShop.editTitle}</DialogTitle>
          </DialogHeader>
          <ShopForm
            initialValues={shop}
            onSuccess={(updated) => {
              setShop(updated);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: ShopStatus }) {
  const styles: Record<
    ShopStatus,
    { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
  > = {
    ACTIVE: { variant: "default", label: "Active" },
    PENDING_REVIEW: { variant: "secondary", label: "Pending Review" },
    DRAFT: { variant: "destructive", label: "Draft (Needs Update)" },
    SUSPENDED: { variant: "destructive", label: "Suspended" },
    CLOSED: { variant: "outline", label: "Closed" },
  };

  const current = styles[status];
  return <Badge variant={current.variant}>{current.label}</Badge>;
}

function ShopForm({
  initialValues,
  isNew = false,
  onSuccess,
  onCancel,
}: {
  initialValues?: Shop | null;
  isNew?: boolean;
  onSuccess: (shop: Shop) => void;
  onCancel?: () => void;
}) {
  const t = useDictionary();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm({
    defaultValues: {
      name: initialValues?.name ?? "",
      slug: initialValues?.slug ?? "",
      descriptionEn: initialValues?.descriptionEn ?? "",
      descriptionMy: initialValues?.descriptionMy ?? "",
      contactPhone: initialValues?.contactPhone ?? "",
      facebookUrl: initialValues?.socialLinks?.facebook ?? "",
      tiktokUrl: initialValues?.socialLinks?.tiktok ?? "",
    } satisfies ShopFormValues,
    validators: { onSubmit: shopFormSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      setIsSaving(true);
      try {
        if (isNew) {
          const created = await createShopAction({
            name: value.name.trim(),
            slug: value.slug.trim(),
            descriptionEn: toOptional(value.descriptionEn),
            descriptionMy: toOptional(value.descriptionMy),
            contactPhone: toOptional(value.contactPhone),
            facebookUrl: toOptional(value.facebookUrl),
            tiktokUrl: toOptional(value.tiktokUrl),
          });
          onSuccess(created);
        } else {
          const updated = await updateMyShopAction({
            name: value.name.trim(),
            descriptionEn: toOptional(value.descriptionEn),
            descriptionMy: toOptional(value.descriptionMy),
            contactPhone: toOptional(value.contactPhone),
            facebookUrl: toOptional(value.facebookUrl),
            tiktokUrl: toOptional(value.tiktokUrl),
          });
          onSuccess(updated);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t.merchantShop.errorSave);
      } finally {
        setIsSaving(false);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <FieldGroup className="gap-4">
        <form.Field name="name">
          {(field) => (
            <FormTextField
              id="shop-name"
              label={t.merchantShop.nameLabel}
              placeholder={t.merchantShop.namePlaceholder}
              field={field}
            />
          )}
        </form.Field>

        {isNew ? (
          <form.Field name="slug">
            {(field) => (
              <FormTextField
                id="shop-slug"
                label={t.merchantShop.slugLabel}
                placeholder={t.merchantShop.slugPlaceholder}
                hint={<p className="text-xs text-muted-foreground">{t.merchantShop.slugHint}</p>}
                field={field}
              />
            )}
          </form.Field>
        ) : (
          <div className="grid gap-1">
            <span className="text-sm font-medium">{t.merchantShop.slugLabel}</span>
            <p className="text-xs text-muted-foreground font-mono">
              /shops/{initialValues?.slug} {t.merchantShop.slugLocked}
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="contactPhone">
            {(field) => (
              <FormTextField
                id="shop-phone"
                label={t.merchantShop.phoneLabel}
                placeholder={t.merchantShop.phonePlaceholder}
                field={field}
              />
            )}
          </form.Field>

          <form.Field name="facebookUrl">
            {(field) => (
              <FormTextField
                id="shop-facebook"
                label={t.merchantShop.facebookUrlLabel}
                placeholder={t.merchantShop.facebookUrlPlaceholder}
                field={field}
              />
            )}
          </form.Field>
        </div>

        <form.Field name="tiktokUrl">
          {(field) => (
            <FormTextField
              id="shop-tiktok"
              label={t.merchantShop.tiktokUrlLabel}
              placeholder={t.merchantShop.tiktokUrlPlaceholder}
              field={field}
            />
          )}
        </form.Field>

        <form.Field name="descriptionEn">
          {(field) => (
            <div className="grid gap-1.5">
              <Label htmlFor="shop-desc-en">{t.merchantShop.descEnLabel}</Label>
              <Textarea
                id="shop-desc-en"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={t.merchantShop.descEnPlaceholder}
                rows={3}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="descriptionMy">
          {(field) => (
            <div className="grid gap-1.5">
              <Label htmlFor="shop-desc-my">{t.merchantShop.descMyLabel}</Label>
              <Textarea
                id="shop-desc-my"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={t.merchantShop.descMyPlaceholder}
                rows={3}
              />
            </div>
          )}
        </form.Field>

        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving
              ? t.merchantShop.saving
              : isNew
                ? t.merchantShop.submitButton
                : t.merchantShop.saveButton}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              {t.merchantProductForm.cancel}
            </Button>
          )}
        </div>
      </FieldGroup>
    </form>
  );
}
