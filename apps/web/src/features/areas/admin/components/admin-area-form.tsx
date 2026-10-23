"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { FormTextField } from "@/components/ui/form-text-field";
import { toOptional } from "@/lib/form";
import { useDictionary } from "@/i18n/dictionary-provider";

import { createArea, updateArea } from "../../areas-actions";
import { areaFormSchema, type AreaFormValues } from "../../areas-schema";
import type { AdminArea } from "../../types/area";

export function AdminAreaForm({
  area,
  onSaved,
  onCancel,
}: {
  area: AdminArea | null;
  onSaved: (area: AdminArea) => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const t = useDictionary();

  const form = useForm({
    defaultValues: {
      slug: area?.slug ?? "",
      nameMy: area?.nameMy ?? "",
      nameEn: area?.nameEn ?? "",
    } satisfies AreaFormValues,
    validators: { onSubmit: areaFormSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      setIsSaving(true);
      const nameEn = toOptional(value.nameEn);
      try {
        const saved = area
          ? await updateArea(area.id, { nameMy: value.nameMy.trim(), nameEn })
          : await createArea({ slug: value.slug.trim(), nameMy: value.nameMy.trim(), nameEn });
        onSaved(saved);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : t.adminAreaForm.errorSave);
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
      aria-label={t.adminAreaForm.formLabel}
    >
      <FieldGroup className="gap-4 border-t pt-4">
        {area ? (
          <div className="grid gap-1">
            <p className="text-sm font-medium">{t.adminAreaForm.slug}</p>
            <p className="text-xs text-muted-foreground">
              {area.slug} {t.adminAreaForm.slugLocked}
            </p>
          </div>
        ) : (
          <form.Field name="slug">
            {(field) => (
              <FormTextField
                id="slug"
                label={t.adminAreaForm.slugLabel}
                placeholder={t.adminAreaForm.slugPlaceholder}
                field={field}
                hint={<p className="text-xs text-muted-foreground">{t.adminAreaForm.slugHint}</p>}
              />
            )}
          </form.Field>
        )}
        <form.Field name="nameMy">
          {(field) => <FormTextField id="nameMy" label={t.adminAreaForm.nameMy} field={field} />}
        </form.Field>
        <form.Field name="nameEn">
          {(field) => <FormTextField id="nameEn" label={t.adminAreaForm.nameEn} field={field} />}
        </form.Field>
        {error ? (
          <p role="alert" className="text-destructive text-xs">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving
              ? t.adminAreaForm.saving
              : area
                ? t.adminAreaForm.saveChanges
                : t.adminAreaForm.createArea}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            {t.adminAreaForm.cancel}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
