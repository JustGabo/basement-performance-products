import type { ReactNode } from "react";
import { Globe } from "lucide-react";
import { quoteCopy, type QuoteLocale } from "@/lib/quotes/copy";

export function internationalQuoteCtaClassName(compact?: boolean) {
  return compact
    ? "flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 bg-brand px-4 text-[9px] font-black tracking-[.05em] text-black uppercase transition hover:bg-[#d99f00]"
    : "flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 bg-brand px-4 text-[10px] font-black tracking-[.06em] text-black uppercase transition hover:bg-[#d99f00]";
}

export function InternationalQuotePromo({
  locale,
  children,
  compact,
}: {
  locale: QuoteLocale;
  children: ReactNode;
  compact?: boolean;
}) {
  const t = quoteCopy[locale];

  return (
    <section
      className={`flex flex-col gap-3 border border-foreground/15 bg-panel/50 ${compact ? "p-4" : "p-5"}`}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center border border-brand/35 text-brand">
          <Globe size={18} />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-[10px] font-black tracking-[.14em] text-brand uppercase">{t.internationalTitle}</h2>
          <p className="text-xs leading-5 text-foreground/60">{t.internationalBody}</p>
        </div>
      </div>
      {children}
      <p className="text-center text-[10px] leading-4 text-foreground/40">{t.internationalFooter}</p>
    </section>
  );
}
