"use client";

import { useForm, useSelector, type AnyFieldApi } from "@tanstack/react-form";
import { useEffect, useRef, useState } from "react";

import {
  Attachment,
  AttachmentActions,
  AttachmentAction,
  AttachmentMedia,
  AttachmentTrigger,
} from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { FormTextField } from "@/components/ui/form-text-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

import { createPlace, removeUpload, requestUpload, updatePlace } from "../../places-actions";
import { errorMessages, toOptional } from "@/lib/form";
import { cn } from "cn";
import { formatPhotoShrinkHint, PLACE_TAGS, PRICE_LEVEL_LABELS } from "../../places-constants";
import { prepareImageForUpload } from "../../places-image";
import { slugifyPlaceName } from "../../places-slug";

import { placeFormSchema, type PlaceFormValues, type PlaceInput } from "../../places-schema";
import type { Category } from "@/features/categories/types/category";
import type { Area } from "@/features/areas/types/area";
import type { Place } from "../../types/place";
import { PhotoPreviewDialog } from "../../components/photo-preview-dialog";
import { PlaceLocationPicker } from "./place-location-picker";
import { useDictionary, useLocale } from "@/i18n/dictionary-provider";
import { displayName } from "@/i18n/display-name";
import { toast } from "sonner";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

const EMPTY_OPTION_VALUE = "__none__";

function FormSelect({
  id,
  label,
  field,
  placeholder,
  options,
}: {
  id: string;
  label: string;
  field: AnyFieldApi;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  const messages = errorMessages(field.state.meta.errors);
  const value = field.state.value as string;
  return (
    <Field data-invalid={messages.length > 0}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        items={options}
        value={value === "" ? null : value}
        onValueChange={(next) => field.handleChange(next === EMPTY_OPTION_VALUE ? "" : next)}
        onOpenChange={(open) => {
          if (!open) field.handleBlur();
        }}
      >
        <SelectTrigger id={id} aria-invalid={messages.length > 0} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError errors={messages.map((message) => ({ message }))} />
    </Field>
  );
}

export function AdminPlaceForm({
  categories,
  areas,
  place,
  existingSlugs,
  onSaved,
  onCancel,
}: {
  categories: Category[];
  areas: Area[];
  place: Place | null;
  existingSlugs: string[];
  onSaved: (place: Place) => void;
  onCancel: () => void;
}) {
  const [latitude, setLatitude] = useState(place?.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(place?.longitude?.toString() ?? "");
  const [photos, setPhotos] = useState<string[]>([...(place?.photos ?? [])]);
  const [removedPhotos, setRemovedPhotos] = useState<string[]>([]);
  // Selected but not yet uploaded. Nothing reaches storage until submit,
  // so closing the sheet early can never orphan files.
  const [pending, setPending] = useState<{ id: string; file: File; previewUrl: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  // Slug auto-fills from the English name until the admin types one;
  // editing a place that already has a slug never overwrites it.
  const [slugTouched, setSlugTouched] = useState(!!place?.slug);
  const t = useDictionary();
  const locale = useLocale();

  // Object URLs are local-only; revoke leftovers if the sheet closes early.
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  useEffect(
    () => () => {
      pendingRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    },
    [],
  );

  const allPhotos = [...photos, ...pending.map((item) => item.previewUrl)];

  const form = useForm({
    defaultValues: {
      nameMy: place?.nameMy ?? "",
      nameEn: place?.nameEn ?? "",
      slug: place?.slug ?? "",
      descriptionMy: place?.descriptionMy ?? "",
      categoryId: place?.categoryId ?? categories[0]?.id ?? "",
      areaId: place?.areaId ?? "",
      addressText: place?.addressText ?? "",
      phone: place?.phone ?? "",
      phoneSecondary: place?.phoneSecondary ?? "",
      facebookUrl: place?.facebookUrl ?? "",
      telegramHandle: place?.telegramHandle ?? "",
      hoursText: place?.hoursText ?? "",
      priceLevel: place?.priceLevel ?? "",
      priceNote: place?.priceNote ?? "",
      tags: place?.tags ?? [],
      isActive: place?.isActive ?? true,
    } satisfies PlaceFormValues,
    validators: { onSubmit: placeFormSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      const slug = toOptional(value.slug)?.toLowerCase();
      if (slug && existingSlugs.includes(slug)) {
        setError(t.adminForm.errorSlugUsed(slug));
        return;
      }
      setIsSaving(true);
      // Upload staged files first. On failure the batch URLs are deleted
      // again, so a failed save never leaves orphans behind either.
      const uploaded: string[] = [];
      const input: PlaceInput = {
        nameMy: value.nameMy.trim(),
        nameEn: toOptional(value.nameEn),
        slug,
        descriptionMy: toOptional(value.descriptionMy),
        categoryId: value.categoryId,
        areaId: toOptional(value.areaId),
        addressText: toOptional(value.addressText),
        phone: toOptional(value.phone),
        phoneSecondary: toOptional(value.phoneSecondary),
        facebookUrl: toOptional(value.facebookUrl),
        telegramHandle: toOptional(value.telegramHandle),
        hoursText: toOptional(value.hoursText),
        priceLevel: toOptional(value.priceLevel) as PlaceInput["priceLevel"],
        priceNote: toOptional(value.priceNote),
        tags: value.tags,
        latitude: latitude ? Number(latitude) : place ? null : undefined,
        longitude: longitude ? Number(longitude) : place ? null : undefined,
        photos,
        isActive: value.isActive,
      };
      try {
        let convertedCount = 0;
        let convertedBytes = 0;
        for (const item of pendingRef.current) {
          const prepared = await prepareImageForUpload(item.file);
          if (prepared.converted) {
            convertedCount += 1;
            convertedBytes += prepared.savedBytes;
          }
          const ticket = await requestUpload(prepared.file.type);
          const response = await fetch(ticket.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": prepared.file.type },
            body: prepared.file,
          });
          if (!response.ok) throw new Error(t.adminForm.errorUpload(item.file.name));
          uploaded.push(ticket.url);
        }
        if (convertedCount > 0) {
          const savedKb = Math.round(convertedBytes / 1024);
          toast.success(formatPhotoShrinkHint(convertedCount, savedKb));
        }
        input.photos = [...photos, ...uploaded];
        const saved = place ? await updatePlace(place.id, input) : await createPlace(input);
        try {
          await Promise.all(removedPhotos.map((url) => removeUpload(url)));
        } catch {
          setError(t.adminForm.errorPhotosRemoved);
          return;
        }
        setRemovedPhotos([]);
        pendingRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        setPending([]);
        onSaved(saved);
      } catch (requestError) {
        // The place was not saved, so batch URLs would orphan — delete them.
        await Promise.allSettled(uploaded.map((url) => removeUpload(url)));
        setError(requestError instanceof Error ? requestError.message : t.adminForm.errorSave);
      } finally {
        setIsSaving(false);
      }
    },
  });

  const nameEnValue = useSelector(form.store, (state) => state.values.nameEn);
  useEffect(() => {
    if (!slugTouched && nameEnValue.trim()) {
      form.setFieldValue("slug", slugifyPlaceName(nameEnValue) ?? "");
    }
  }, [nameEnValue, slugTouched, form]);

  function stageFiles(files: File[]) {
    if (files.length === 0) return;
    setPhotoError(null);
    for (const file of files) {
      if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
        setPhotoError(t.adminForm.errorFileType(file.name));
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setPhotoError(t.adminForm.errorFileSize(file.name));
        continue;
      }
      setPending((current) => [
        ...current,
        { id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) },
      ]);
    }
  }

  function removePending(id: string) {
    const item = pendingRef.current.find((entry) => entry.id === id);
    if (item) URL.revokeObjectURL(item.previewUrl);
    setPending((current) => current.filter((entry) => entry.id !== id));
  }

  function handleCancel() {
    pendingRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setPending([]);
    onCancel();
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
      aria-label={t.adminForm.formLabel}
    >
      <FieldGroup className="gap-4 border-t pt-4">
        <p className="text-sm font-medium">{t.adminForm.details}</p>
        <form.Field name="nameMy">
          {(field) => <FormTextField id="nameMy" label={t.adminForm.nameMy} field={field} />}
        </form.Field>
        <form.Field name="nameEn">
          {(field) => <FormTextField id="nameEn" label={t.adminForm.nameEn} field={field} />}
        </form.Field>
        <form.Field name="slug">
          {(field) => {
            const messages = errorMessages(field.state.meta.errors);
            const trimmed = field.state.value.trim().toLowerCase();
            return (
              <Field data-invalid={messages.length > 0}>
                <FieldLabel htmlFor="slug">{t.adminForm.slug}</FieldLabel>
                <Input
                  id="slug"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    setSlugTouched(true);
                    field.handleChange(event.target.value);
                  }}
                  placeholder={t.adminForm.slugPlaceholder}
                  aria-invalid={messages.length > 0}
                  aria-describedby="slug-preview"
                />
                <p id="slug-preview" className="text-xs text-muted-foreground">
                  {trimmed ? t.adminForm.slugPreview(trimmed) : t.adminForm.slugEmptyHint}
                </p>
                <FieldError errors={messages.map((message) => ({ message }))} />
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="categoryId">
          {(field) => (
            <FormSelect
              id="categoryId"
              label={t.adminForm.category}
              field={field}
              placeholder={t.adminForm.categoryPlaceholder}
              options={categories.map((category) => ({
                value: category.id,
                label: displayName(category.nameMy, category.nameEn, locale),
              }))}
            />
          )}
        </form.Field>
        <form.Field name="areaId">
          {(field) => (
            <FormSelect
              id="areaId"
              label={t.adminForm.area}
              field={field}
              placeholder={t.adminForm.areaEmpty}
              options={[
                { value: EMPTY_OPTION_VALUE, label: t.adminForm.areaEmpty },
                ...areas.map((area) => ({
                  value: area.id,
                  label: displayName(area.nameMy, area.nameEn, locale),
                })),
              ]}
            />
          )}
        </form.Field>
        <form.Field name="priceLevel">
          {(field) => (
            <FormSelect
              id="priceLevel"
              label={t.adminForm.priceLevel}
              field={field}
              placeholder={t.adminForm.priceLevelEmpty}
              options={[
                { value: EMPTY_OPTION_VALUE, label: t.adminForm.priceLevelEmpty },
                ...(Object.keys(PRICE_LEVEL_LABELS) as (keyof typeof PRICE_LEVEL_LABELS)[]).map(
                  (level) => ({
                    value: level,
                    label: `${PRICE_LEVEL_LABELS[level].symbol} · ${t.priceLevels[level]}`,
                  }),
                ),
              ]}
            />
          )}
        </form.Field>
        <form.Field name="descriptionMy">
          {(field) => {
            const messages = errorMessages(field.state.meta.errors);
            return (
              <Field data-invalid={messages.length > 0}>
                <FieldLabel htmlFor="descriptionMy">{t.adminForm.description}</FieldLabel>
                <Textarea
                  id="descriptionMy"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={messages.length > 0}
                />
                <FieldError errors={messages.map((message) => ({ message }))} />
              </Field>
            );
          }}
        </form.Field>
        <div className="grid gap-1">
          <Label htmlFor="photos">{t.adminForm.photos}</Label>
          <Input
            id="photos"
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            multiple
            disabled={isSaving}
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = "";
              stageFiles(files);
            }}
          />
          {allPhotos.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {[
                ...photos.map((photo, index) => ({
                  key: photo,
                  src: photo,
                  label: t.adminForm.photoLabel(index + 1),
                  onPreview: () => setPreviewIndex(index),
                  onRemove: () => {
                    setRemovedPhotos((current) => [...current, photo]);
                    setPhotos((current) => current.filter((_, i) => i !== index));
                  },
                })),
                ...pending.map((item, pendingIndex) => ({
                  key: item.id,
                  src: item.previewUrl,
                  label: t.adminForm.newPhotoLabel(pendingIndex + 1),
                  onPreview: () => setPreviewIndex(photos.length + pendingIndex),
                  onRemove: () => removePending(item.id),
                })),
              ].map((thumb) => (
                <Attachment key={thumb.key} size="sm" state="done" className="min-w-0">
                  <AttachmentMedia variant="image">
                    <img src={thumb.src} alt={thumb.label} />
                  </AttachmentMedia>
                  <AttachmentTrigger
                    onClick={thumb.onPreview}
                    aria-label={t.adminForm.previewLabel(thumb.label)}
                  />
                  <AttachmentActions>
                    <AttachmentAction
                      aria-label={t.adminForm.removeLabel(thumb.label)}
                      onClick={thumb.onRemove}
                    >
                      <X />
                    </AttachmentAction>
                  </AttachmentActions>
                </Attachment>
              ))}
            </div>
          ) : null}
          {photoError ? (
            <p role="alert" className="text-destructive text-xs">
              {photoError}
            </p>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["addressText", t.adminForm.address],
              ["phone", t.adminForm.phone],
              ["phoneSecondary", t.adminForm.phoneSecondary],
              ["facebookUrl", t.adminForm.facebookUrl],
              ["telegramHandle", t.adminForm.telegramHandle],
              ["hoursText", t.adminForm.hours],
              ["priceNote", t.adminForm.priceNote],
            ] as const
          ).map(([key, label]) => (
            <form.Field key={key} name={key}>
              {(field) => <FormTextField id={key} label={label} field={field} />}
            </form.Field>
          ))}
        </div>
        <form.Field name="tags">
          {(field) => (
            <div className="grid gap-2">
              <span id="place-tags-label" className="text-sm font-medium">
                {t.adminForm.tags}
              </span>
              <div role="group" aria-labelledby="place-tags-label" className="flex flex-wrap gap-2">
                {PLACE_TAGS.map((tag) => {
                  const checked = field.state.value.includes(tag);
                  return (
                    <label
                      key={tag}
                      className={cn(
                        "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs transition-colors",
                        "outline-offset-2 focus-within:outline-2",
                        checked
                          ? "border-primary bg-muted font-medium"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(next) => {
                          const on = next === true;
                          field.handleChange(
                            on
                              ? [...field.state.value, tag]
                              : field.state.value.filter((item) => item !== tag),
                          );
                        }}
                        aria-label={t.tagLabels[tag]}
                      />
                      {t.tagLabels[tag]}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </form.Field>
        <div className="grid gap-2">
          <div>
            <p className="text-sm font-medium">{t.adminForm.location}</p>
            <p className="text-xs text-muted-foreground">{t.adminForm.locationHint}</p>
          </div>
          <PlaceLocationPicker
            latitude={latitude ? Number(latitude) : undefined}
            longitude={longitude ? Number(longitude) : undefined}
            onChange={(nextLatitude, nextLongitude) => {
              setLatitude(nextLatitude?.toFixed(6) ?? "");
              setLongitude(nextLongitude?.toFixed(6) ?? "");
            }}
          />
        </div>
        <form.Field name="isActive">
          {(field) => (
            <Field orientation="horizontal">
              <input
                type="checkbox"
                id="isActive"
                checked={field.state.value}
                onChange={(event) => field.handleChange(event.target.checked)}
              />
              <FieldLabel htmlFor="isActive">{t.adminForm.visible}</FieldLabel>
            </Field>
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
              ? t.adminForm.saving
              : place
                ? t.adminForm.saveChanges
                : t.adminForm.createPlace}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
            {t.adminForm.cancel}
          </Button>
        </div>
      </FieldGroup>
      <form.Subscribe selector={(state) => state.values.nameMy}>
        {(nameMy) => (
          <PhotoPreviewDialog
            photos={allPhotos}
            index={previewIndex ?? 0}
            placeName={nameMy}
            open={previewIndex !== null}
            onOpenChange={(open) => {
              if (!open) setPreviewIndex(null);
            }}
            onIndexChange={setPreviewIndex}
          />
        )}
      </form.Subscribe>
    </form>
  );
}
