import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/site/BrandLogo";

export function StatusScreen({
  code,
  title,
  body,
  primaryHref = "/",
  primaryLabel = "Back to the shop",
  secondary,
}: {
  code: string;
  title: string;
  body: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondary?: ReactNode;
}) {
  return <main className="grid min-h-svh place-items-center bg-ink px-6 py-16 text-foreground">
    <section className="flex w-full max-w-xl flex-col items-center gap-6 text-center">
      <BrandLogo compact />
      <p className="text-[10px] font-black tracking-[.18em] text-brand uppercase">{code}</p>
      <h1 className="font-display text-[clamp(42px,7vw,72px)] leading-[.9] font-bold tracking-[-.04em] uppercase">{title}</h1>
      <p className="max-w-md text-sm leading-6 text-foreground/60">{body}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link className="flex min-h-12 items-center justify-center bg-brand px-6 text-[10px] font-black tracking-[.08em] text-black uppercase" href={primaryHref}>{primaryLabel}</Link>
        {secondary}
      </div>
    </section>
  </main>;
}
