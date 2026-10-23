"use client";

import { useForm } from "@tanstack/react-form";
import type { Route } from "next";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import { useDictionary } from "@/i18n/dictionary-provider";

import Loader from "../../../components/loader";
import { AuthShell, FieldError } from "@/components/auth-shell";

export default function SignUpForm() {
  const router = useRouter();
  const t = useDictionary();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            router.refresh();
            toast.success(t.auth.signUpSuccess);
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <AuthShell
      title={t.auth.createAccount}
      footer={
        <Link
          href={"/login" as Route}
          className={buttonVariants({ variant: "link", className: "text-muted-foreground" })}
        >
          {t.auth.haveAccount}
        </Link>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="name">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>{t.auth.name}</Label>
              <Input
                id={field.name}
                name={field.name}
                autoComplete="name"
                className="h-11"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>{t.auth.email}</Label>
              <Input
                id={field.name}
                name={field.name}
                type="email"
                autoComplete="email"
                className="h-11"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>{t.auth.password}</Label>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="new-password"
                className="h-11"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button
              type="submit"
              size="lg"
              className="h-12 w-full rounded-full text-base font-semibold shadow-md shadow-primary/25"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? t.auth.submitting : t.auth.signUp}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthShell>
  );
}
