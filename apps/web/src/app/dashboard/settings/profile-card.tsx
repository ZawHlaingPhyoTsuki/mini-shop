"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/i18n/dictionary-provider";
import { authClient } from "@/lib/auth-client";

export function ProfileCard({ name, email }: { name: string | null; email: string }) {
  const router = useRouter();
  const t = useDictionary();
  const initialName = name ?? "";
  const [displayName, setDisplayName] = useState(initialName);
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  async function saveName(event: SubmitEvent) {
    event.preventDefault();
    setSavingName(true);
    const { error } = await authClient.updateUser({ name: displayName.trim() });
    setSavingName(false);
    if (error) {
      toast.error(error.message ?? t.settings.errorProfile);
      return;
    }
    toast.success(t.settings.profileSaved);
    router.refresh();
  }

  async function savePassword(event: SubmitEvent) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError(t.settings.passwordMismatch);
      return;
    }
    setPasswordError(null);
    setSavingPassword(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setSavingPassword(false);
    if (error) {
      setPasswordError(error.message ?? t.settings.errorPassword);
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success(t.settings.passwordChanged);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.settings.profile}</CardTitle>
        <CardDescription>{t.settings.profileBody}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <form onSubmit={saveName} className="grid gap-3">
          <Field>
            <FieldLabel htmlFor="profile-name">{t.settings.displayName}</FieldLabel>
            <div className="flex gap-2">
              <Input
                id="profile-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                autoComplete="name"
              />
              <Button
                type="submit"
                disabled={savingName || !displayName.trim() || displayName === initialName}
              >
                {savingName ? t.settings.saving : t.settings.save}
              </Button>
            </div>
          </Field>
          <Field>
            <FieldLabel htmlFor="profile-email">{t.settings.email}</FieldLabel>
            <Input id="profile-email" value={email} disabled />
          </Field>
        </form>
        <form onSubmit={savePassword} className="grid gap-3 border-t pt-6">
          <Field>
            <FieldLabel htmlFor="profile-current-password">{t.settings.currentPassword}</FieldLabel>
            <Input
              id="profile-current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="profile-new-password">{t.settings.newPassword}</FieldLabel>
            <Input
              id="profile-new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
            />
          </Field>
          <Field data-invalid={passwordError !== null}>
            <FieldLabel htmlFor="profile-confirm-password">{t.settings.confirmPassword}</FieldLabel>
            <Input
              id="profile-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              aria-invalid={passwordError !== null}
            />
            {passwordError ? <FieldError errors={[{ message: passwordError }]} /> : null}
          </Field>
          <Button
            type="submit"
            variant="outline"
            disabled={savingPassword || !currentPassword || !newPassword}
            className="justify-self-start"
          >
            {savingPassword ? t.settings.changing : t.settings.changePassword}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
