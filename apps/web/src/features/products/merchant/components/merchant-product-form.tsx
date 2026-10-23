"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { FormTextField } from "@/components/ui/form-text-field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toOptional } from "@/lib/form";
import { useDictionary } from "@/i18n/dictionary-provider";

import { createProductAction, updateProductAction } from "../../products-actions";
import { productFormSchema, type ProductFormValues } from "../../products-schema";
import type { Product } from "../../types/product";
import type { Category } from "@/features/categories/types/category";

export function MerchantProductForm({
  product,
  categories,
  onSaved,
  onCancel,
}: {
  product?: Product | null;
  categories: Category[];
  onSaved: (product: Product) => void;
  onCancel: () => void;
}) {
  const t = useDictionary();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(product?.categoryId ?? "");

  const isEditing = Boolean(product);

  const form = useForm({
    defaultValues: {
      nameEn: product?.nameEn ?? "",
      nameMy: product?.nameMy ?? "",
      slug: product?.slug ?? "",
      categoryId: product?.categoryId ?? "",
      priceMMK: product?.priceMMK !== undefined ? String(product.priceMMK) : "",
      priceTHB:
        product?.priceTHB !== undefined && product.priceTHB !== null
          ? String(product.priceTHB)
          : "",
      stockQuantity:
        product?.stockQuantity !== undefined && product.stockQuantity !== null
          ? String(product.stockQuantity)
          : "",
      sku: product?.sku ?? "",
      descriptionEn: product?.descriptionEn ?? "",
      descriptionMy: product?.descriptionMy ?? "",
      status:
        product?.status === "PUBLISHED" || product?.status === "ARCHIVED"
          ? product.status
          : "DRAFT",
    } satisfies ProductFormValues,
    validators: { onSubmit: productFormSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      setIsSaving(true);
      try {
        const priceMMK = parseInt(value.priceMMK, 10);
        if (isNaN(priceMMK) || priceMMK <= 0) {
          setError("Price in MMK must be a positive whole number");
          setIsSaving(false);
          return;
        }

        const priceTHB = value.priceTHB ? parseInt(value.priceTHB, 10) : undefined;
        if (priceTHB !== undefined && (isNaN(priceTHB) || priceTHB <= 0)) {
          setError("Price in THB must be a positive whole number");
          setIsSaving(false);
          return;
        }

        const stockQuantity = value.stockQuantity ? parseInt(value.stockQuantity, 10) : null;
        if (stockQuantity !== null && (isNaN(stockQuantity) || stockQuantity < 0)) {
          setError("Stock quantity must be a non-negative number");
          setIsSaving(false);
          return;
        }

        const categoryId = selectedCategory || undefined;

        if (isEditing && product) {
          const updated = await updateProductAction(product.id, {
            nameEn: value.nameEn.trim(),
            nameMy: toOptional(value.nameMy),
            categoryId,
            priceMMK,
            priceTHB,
            stockQuantity,
            sku: toOptional(value.sku),
            descriptionEn: toOptional(value.descriptionEn),
            descriptionMy: toOptional(value.descriptionMy),
          });
          onSaved(updated);
        } else {
          const created = await createProductAction({
            nameEn: value.nameEn.trim(),
            nameMy: toOptional(value.nameMy),
            slug: value.slug.trim(),
            categoryId,
            priceMMK,
            priceTHB,
            stockQuantity,
            sku: toOptional(value.sku),
            descriptionEn: toOptional(value.descriptionEn),
            descriptionMy: toOptional(value.descriptionMy),
          });
          onSaved(created);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t.merchantProductForm.errorSave);
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
        <form.Field name="nameEn">
          {(field) => (
            <FormTextField
              id="product-name-en"
              label={t.merchantProductForm.nameEnLabel}
              placeholder={t.merchantProductForm.nameEnPlaceholder}
              field={field}
            />
          )}
        </form.Field>

        <form.Field name="nameMy">
          {(field) => (
            <FormTextField
              id="product-name-my"
              label={t.merchantProductForm.nameMyLabel}
              placeholder={t.merchantProductForm.nameMyPlaceholder}
              field={field}
            />
          )}
        </form.Field>

        {!isEditing ? (
          <form.Field name="slug">
            {(field) => (
              <FormTextField
                id="product-slug"
                label={t.merchantProductForm.slugLabel}
                placeholder={t.merchantProductForm.slugPlaceholder}
                hint={
                  <p className="text-xs text-muted-foreground">{t.merchantProductForm.slugHint}</p>
                }
                field={field}
              />
            )}
          </form.Field>
        ) : (
          <div className="grid gap-1">
            <span className="text-sm font-medium">{t.merchantProductForm.slugLabel}</span>
            <p className="text-xs text-muted-foreground font-mono">{product?.slug}</p>
          </div>
        )}

        {/* Category selector */}
        <div className="grid gap-1.5">
          <Label htmlFor="product-category">{t.merchantProductForm.categoryLabel}</Label>
          <Select
            value={selectedCategory}
            onValueChange={(val) => {
              if (val !== null) setSelectedCategory(val);
            }}
          >
            <SelectTrigger id="product-category">
              <SelectValue placeholder={t.merchantProductForm.categoryPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.nameEn} {cat.nameMy ? `(${cat.nameMy})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pricing */}
        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="priceMMK">
            {(field) => (
              <FormTextField
                id="product-price-mmk"
                label={t.merchantProductForm.priceMMKLabel}
                placeholder={t.merchantProductForm.priceMMKPlaceholder}
                hint={
                  <p className="text-xs text-muted-foreground">
                    {t.merchantProductForm.priceMMKHint}
                  </p>
                }
                field={field}
              />
            )}
          </form.Field>

          <form.Field name="priceTHB">
            {(field) => (
              <FormTextField
                id="product-price-thb"
                label={t.merchantProductForm.priceTHBLabel}
                placeholder={t.merchantProductForm.priceTHBPlaceholder}
                field={field}
              />
            )}
          </form.Field>
        </div>

        {/* Stock & SKU */}
        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="stockQuantity">
            {(field) => (
              <FormTextField
                id="product-stock"
                label={t.merchantProductForm.stockLabel}
                placeholder={t.merchantProductForm.stockPlaceholder}
                field={field}
              />
            )}
          </form.Field>

          <form.Field name="sku">
            {(field) => (
              <FormTextField
                id="product-sku"
                label={t.merchantProductForm.skuLabel}
                placeholder={t.merchantProductForm.skuPlaceholder}
                field={field}
              />
            )}
          </form.Field>
        </div>

        {/* Descriptions */}
        <form.Field name="descriptionEn">
          {(field) => (
            <div className="grid gap-1.5">
              <Label htmlFor="product-desc-en">{t.merchantProductForm.descEnLabel}</Label>
              <Textarea
                id="product-desc-en"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={t.merchantProductForm.descEnPlaceholder}
                rows={3}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="descriptionMy">
          {(field) => (
            <div className="grid gap-1.5">
              <Label htmlFor="product-desc-my">{t.merchantProductForm.descMyLabel}</Label>
              <Textarea
                id="product-desc-my"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={t.merchantProductForm.descMyPlaceholder}
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
              ? t.merchantProductForm.saving
              : isEditing
                ? t.merchantProductForm.saveChanges
                : t.merchantProductForm.createProduct}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            {t.merchantProductForm.cancel}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
