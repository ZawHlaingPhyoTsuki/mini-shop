import Link from "next/link";
import { Store } from "lucide-react";

export function PublicBrandLink({ compact = false, label }: { compact?: boolean; label: string }) {
  return (
    <Link
      href="/"
      aria-label={label}
      className={
        compact
          ? "flex h-8 items-center gap-2 rounded-full pr-2 pl-1 font-heading text-sm font-semibold"
          : "flex shrink-0 items-center gap-2 font-heading text-lg font-semibold tracking-tight"
      }
    >
      <span
        className={
          compact
            ? "grid size-7 place-items-center rounded-full bg-primary text-primary-foreground"
            : "grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm"
        }
      >
        <Store className={compact ? "size-3.5" : "size-4"} aria-hidden />
      </span>
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
