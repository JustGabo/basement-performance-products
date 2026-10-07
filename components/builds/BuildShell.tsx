"use client";

import Link from "next/link";
import { ArrowLeft, UserRound, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const buildShell = "mx-auto w-[min(1480px,calc(100%_-_56px))] max-[700px]:w-[calc(100%_-_32px)]";
export const buildDisplay = "font-display font-bold uppercase";

export function BuildHeader({ backHref = "/", backLabel = "Back to shop" }: { backHref?: string; backLabel?: string }) {
  return <header className="sticky top-0 z-30 grid h-21 grid-cols-[1fr_auto_1fr] items-center gap-6 border-b border-foreground/12 bg-ink/90 px-[max(28px,calc((100vw-1480px)/2))] shadow-[0_4px_14px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:shadow-xl max-[700px]:h-18 max-[700px]:px-4">
    <Link className="flex w-max items-center gap-2 text-[10px] font-black tracking-[.05em] text-foreground/55 uppercase transition hover:text-brand max-[520px]:text-[0]" href={backHref}><ArrowLeft size={17} /><span className="max-[520px]:hidden">{backLabel}</span></Link>
    <Link className="flex items-center gap-3 justify-self-center" href="/" aria-label="Basement Performance Products home"><Zap className="h-6 w-4 fill-brand text-brand" /><strong className="text-[27px] leading-none font-black tracking-[-.05em] italic max-[700px]:text-[21px]">BASEMENT</strong><span className="border-l border-foreground/30 pl-3 text-[7px] leading-[1.4] font-bold tracking-[.24em] max-[820px]:hidden">PERFORMANCE<br />PRODUCTS</span></Link>
    <div className="flex items-center justify-self-end gap-3"><ThemeToggle compact /><Link className="grid size-8 place-items-center transition hover:text-brand max-[520px]:hidden" href="/account" aria-label="Customer account"><UserRound size={19} /></Link><CartDrawer /></div>
  </header>;
}

export function BuildFooter() {
  return <footer className={`${buildShell} flex shrink-0 items-center justify-between gap-6 border-t border-foreground/12 py-3 text-[10px] text-foreground/45 max-[600px]:flex-col max-[600px]:items-start max-[600px]:py-4`}><span>© 2026 Basement Performance Products.</span><div className="flex gap-5"><Link className="hover:text-brand" href="/terms">Terms</Link><Link className="hover:text-brand" href="/privacy">Privacy</Link><Link className="hover:text-brand" href="/contact">Contact</Link></div></footer>;
}

export function BuildLayout({ children, backHref, backLabel }: { children: ReactNode; backHref?: string; backLabel?: string }) {
  return <main className="flex min-h-dvh flex-col bg-ink text-foreground"><BuildHeader backHref={backHref} backLabel={backLabel} />{children}<BuildFooter /></main>;
}
