import type { ReactNode } from "react";

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="border-b border-border/60 bg-linear-to-b from-primary/10 to-transparent">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <h1 className="font-heading text-3xl leading-[1.35] font-semibold tracking-tight text-balance sm:text-5xl">
          {title}
        </h1>
        {children ? (
          <p className="mt-4 max-w-2xl text-base leading-loose text-muted-foreground sm:text-lg">
            {children}
          </p>
        ) : null}
      </div>
    </section>
  );
}
