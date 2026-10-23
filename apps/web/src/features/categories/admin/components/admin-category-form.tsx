"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { FormTextField } from "@/components/ui/form-text-field";
import { toOptional } from "@/lib/form";
import { useDictionary } from "@/i18n/dictionary-provider";

import { createCategory, updateCategory } from "../../categories-actions";
import { categoryFormSchema, type CategoryFormValues } from "../../categories-schema";
import type { AdminCategory } from "../../types/category";

export function AdminCategoryForm({
  category,
  onSaved,
  onCancel,
}: {
  category: AdminCategory | null;
  onSaved: (category: AdminCategory) => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const t = useDictionary();

  const form = useForm({
    defaultValues: {
      slug: category?.slug ?? "",
      nameMy: category?.nameMy ?? "",
      nameEn: category?.nameEn ?? "",
    } satisfies CategoryFormValues,
    validators: { onSubmit: categoryFormSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      setIsSaving(true);
      const nameEn = toOptional(value.nameEn);
      try {
        const saved = category
          ? await updateCategory(category.id, { nameMy: value.nameMy.trim(), nameEn })
          : await createCategory({ slug: value.slug.trim(), nameMy: value.nameMy.trim(), nameEn });
        onSaved(saved);
      } catch (requestError) {
        setError(
          requestError instanceof Error ? requestError.message : t.adminCategoryForm.errorSave,
        );
      } finally {
        setIsSaving(false);
      }
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
      aria-label={t.adminCategoryForm.formLabel}
    >
      <FieldGroup className="gap-4 border-t pt-4">
        {category ? (
          <div className="grid gap-1">
            <p className="text-sm font-medium">{t.adminCategoryForm.slug}</p>
            <p className="text-xs text-muted-foreground">
              {category.slug} {t.adminCategoryForm.slugLocked}
            </p>
          </div>
        ) : (
          <form.Field name="slug">
            {(field) => (
              <FormTextField
                id="slug"
                label={t.adminCategoryForm.slugLabel}
                placeholder={t.adminCategoryForm.slugPlaceholder}
                field={field}
                hint={
                  <p className="text-xs text-muted-foreground">{t.adminCategoryForm.slugHint}</p>
                }
              />
            )}
          </form.Field>
        )}
        <form.Field name="nameMy">
          {(field) => (
            <FormTextField id="nameMy" label={t.adminCategoryForm.nameMy} field={field} />
          )}
        </form.Field>
        <form.Field name="nameEn">
          {(field) => (
            <FormTextField id="nameEn" label={t.adminCategoryForm.nameEn} field={field} />
          )}
        </form.Field>
        {error ? (
          <p role="alert" className="text-destructive text-xs">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving
              ? t.adminCategoryForm.saving
              : category
                ? t.adminCategoryForm.saveChanges
                : t.adminCategoryForm.createCategory}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            {t.adminCategoryForm.cancel}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
