import type { ReactNode } from "react";

export function AdminPageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="flex items-end justify-between gap-6 max-[700px]:items-start max-[700px]:flex-col"><div className="flex flex-col gap-2"><p className="text-[10px] font-black tracking-[.2em] text-brand uppercase">{eyebrow}</p><h1 className="font-display text-[clamp(42px,5vw,68px)] leading-[.88] font-bold tracking-[-.03em] uppercase">{title}</h1><p className="max-w-2xl text-sm leading-6 text-foreground/50">{description}</p></div>{action}</div>;
}
