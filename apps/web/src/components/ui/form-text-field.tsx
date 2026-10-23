"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { errorMessages } from "@/lib/form";

type FormTextFieldProps = {
  id: string;
  label: string;
  placeholder?: string;
  hint?: React.ReactNode;
  field: {
    name: string;
    state: { value: string; meta: { errors: unknown } };
    handleBlur: () => void;
    handleChange: (value: string) => void;
  };
};

export function FormTextField({ id, label, placeholder, hint, field }: FormTextFieldProps) {
  const messages = errorMessages(field.state.meta.errors);
  return (
    <Field data-invalid={messages.length > 0}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={messages.length > 0}
      />
      {hint}
      <FieldError errors={messages.map((message) => ({ message }))} />
    </Field>
  );
}
