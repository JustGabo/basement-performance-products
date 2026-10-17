"use client";

import { useEffect, useState } from "react";
import { QuoteSessionsSidebar } from "@/components/quotes/QuoteSessionsSidebar";
import { listQuoteSessions, type SavedQuoteSession } from "@/lib/quotes/client-sessions";
import { QUOTE_EMBEDDED_SHELL_CLASS } from "@/lib/quotes/shell-layout";
import type { QuoteLocale } from "@/lib/quotes/copy";

export function QuoteListShell({
  locale = "en",
  basePath = "/quotes",
  embedded = false,
}: {
  locale?: QuoteLocale;
  basePath?: string;
  embedded?: boolean;
}) {
  const [sessions, setSessions] = useState<SavedQuoteSession[]>([]);

  useEffect(() => {
    setSessions(listQuoteSessions());
  }, []);

  const shell = (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:items-stretch">
      <QuoteSessionsSidebar
        sessions={sessions}
        activeId=""
        locale={locale}
        showShopLink={!embedded}
        basePath={basePath}
        className="h-full w-full lg:w-[360px]"
      />
      <section className="hidden min-h-0 flex-1 flex-col items-center justify-center gap-2 px-6 text-center lg:flex">
        <p className="text-[10px] font-black tracking-[.14em] text-brand uppercase">
          {locale === "es" ? "Cotizaciones" : "Quotes"}
        </p>
        <h1 className="font-display text-3xl font-bold uppercase">
          {locale === "es" ? "Elige una conversación" : "Select a conversation"}
        </h1>
        <p className="max-w-md text-sm text-foreground/50">
          {locale === "es"
            ? "Abre una cotización de la lista o solicita una nueva desde la ficha del producto."
            : "Open a quote from the list or start a new one from a product page."}
        </p>
      </section>
    </div>
  );

  if (embedded) {
    return <div className={QUOTE_EMBEDDED_SHELL_CLASS}>{shell}</div>;
  }

  return <main className="flex h-dvh flex-col overflow-hidden bg-ink text-foreground">{shell}</main>;
}
