"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export function SharePlaceButton({
  title,
  label,
  copiedLabel,
}: {
  title: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className={buttonVariants({
        variant: "outline",
        size: "sm",
        className: "h-9 gap-1.5 rounded-full bg-card px-4",
      })}
    >
      <Share2 className="size-4" aria-hidden />
      {copied ? copiedLabel : label}
    </button>
  );
}
