import { redirect } from "next/navigation";

import { getServerSession } from "@/features/auth/admin-session";
import { getDictionary } from "@/i18n/get-dictionary";

import { AppearanceCard } from "./appearance-card";
import { ProfileCard } from "./profile-card";

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/login");
  const t = await getDictionary();

  return (
    <main className="container mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-semibold">{t.settings.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t.settings.subtitle}</p>
      <div className="mt-6 grid gap-4">
        <AppearanceCard />
        <ProfileCard name={session.user.name} email={session.user.email} />
      </div>
    </main>
  );
}
