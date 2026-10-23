import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { shopInputSchema, type ShopInput } from "@/features/shops/schema";
import { createShop, updateMyShop } from "@/features/shops/server";

export type ShopFormValues = {
  name: string;
  slug: string;
  descriptionEn?: string | null;
  descriptionMy?: string | null;
  contactPhone?: string | null;
};

export default function ShopForm({ shop }: { shop?: ShopFormValues | null }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const defaultValues: ShopInput = {
    name: shop?.name ?? "",
    slug: shop?.slug ?? "",
    descriptionEn: shop?.descriptionEn ?? undefined,
    descriptionMy: shop?.descriptionMy ?? undefined,
    contactPhone: shop?.contactPhone ?? undefined,
  };

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      setFormError(null);

      const result = shop ? await updateMyShop({ data: value }) : await createShop({ data: value });

      if ("error" in result && result.error) {
        setFormError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success(shop ? "Shop updated" : "Shop submitted for review");
      await router.invalidate();
    },
    validators: { onSubmit: shopInputSchema },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <form.Field name="name">
          {(field) => (
            <>
              <Label htmlFor={field.name}>Shop name</Label>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-sm text-destructive">
                  {error?.message}
                </p>
              ))}
            </>
          )}
        </form.Field>
      </div>

      <div className="space-y-2">
        <form.Field name="slug">
          {(field) => (
            <>
              <Label htmlFor={field.name}>Shop URL</Label>
              <Input
                id={field.name}
                value={field.state.value}
                placeholder="my-shop"
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Lowercase letters, numbers, and hyphens. This is your public shop address.
              </p>
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-sm text-destructive">
                  {error?.message}
                </p>
              ))}
            </>
          )}
        </form.Field>
      </div>

      <div className="space-y-2">
        <form.Field name="descriptionEn">
          {(field) => (
            <>
              <Label htmlFor={field.name}>Description (English)</Label>
              <Textarea
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </>
          )}
        </form.Field>
      </div>

      <div className="space-y-2">
        <form.Field name="descriptionMy">
          {(field) => (
            <>
              <Label htmlFor={field.name}>Description (Myanmar)</Label>
              <Textarea
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </>
          )}
        </form.Field>
      </div>

      <div className="space-y-2">
        <form.Field name="contactPhone">
          {(field) => (
            <>
              <Label htmlFor={field.name}>Contact phone</Label>
              <Input
                id={field.name}
                type="tel"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </>
          )}
        </form.Field>
      </div>

      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : shop ? "Save changes" : "Submit for review"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
