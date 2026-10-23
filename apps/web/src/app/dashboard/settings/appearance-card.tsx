"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDictionary } from "@/i18n/dictionary-provider";

export function AppearanceCard() {
  const { theme, setTheme } = useTheme();
  const t = useDictionary();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const themes = [
    { value: "light", label: t.settings.light, icon: Sun },
    { value: "dark", label: t.settings.dark, icon: Moon },
    { value: "system", label: t.settings.system, icon: Monitor },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.settings.appearance}</CardTitle>
        <CardDescription>{t.settings.appearanceBody}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2" role="group" aria-label={t.settings.themeLabel}>
          {themes.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              type="button"
              variant={mounted && theme === value ? "default" : "outline"}
              onClick={() => setTheme(value)}
              disabled={!mounted}
              aria-pressed={mounted && theme === value}
              className="flex-1"
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
