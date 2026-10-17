"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "cn";
import type { SavedQuoteSession } from "@/lib/quotes/client-sessions";
import type { QuoteLocale } from "@/lib/quotes/copy";

function statusLabel(status: string | undefined, locale: QuoteLocale) {
  switch (status) {
    case "quoted":
      return locale === "es" ? "Lista" : "Ready";
    case "reviewing":
      return locale === "es" ? "En revisión" : "Reviewing";
    case "collecting":
      return locale === "es" ? "Pendiente" : "Pending";
    default:
      return locale === "es" ? "Activa" : "Active";
  }
}

export function QuoteSessionsSidebar({
  sessions,
  activeId,
  locale,
  showShopLink = false,
  basePath = "/quotes",
  className,
}: {
  sessions: SavedQuoteSession[];
  activeId: string;
  locale: QuoteLocale;
  showShopLink?: boolean;
  basePath?: string;
  className?: string;
}) {
  const title = locale === "es" ? "Tus cotizaciones" : "Your quotes";

  return (
    <aside
      className={cn(
        "flex min-h-0 w-full shrink-0 flex-col border-foreground/10 bg-panel/40 lg:h-full lg:w-[360px] lg:border-r",
        className,
      )}
    >
      <div className="border-b border-foreground/10 px-4 py-3">
        {showShopLink ? (
          <Link
            className="mb-3 inline-flex items-center gap-2 text-[10px] font-black tracking-[.06em] text-foreground/55 uppercase hover:text-brand"
            href="/shop"
          >
            <ArrowLeft size={14} />
            {locale === "es" ? "Tienda" : "Shop"}
          </Link>
        ) : null}
        <p className="text-[10px] font-black tracking-[.14em] text-brand uppercase">{title}</p>
        <p className="mt-1 text-xs text-foreground/45">
          {locale === "es" ? "Guardadas en este navegador" : "Saved in this browser"}
        </p>
      </div>
      <nav className="quote-sidebar-scroll flex min-h-0 flex-1 flex-col overflow-y-auto">
        {sessions.length === 0 ? (
          <p className="px-4 py-6 text-xs leading-5 text-foreground/45">
            {locale === "es"
              ? "Cuando pidas una cotización desde un producto, aparecerá aquí."
              : "When you request a quote from a product page, it will show up here."}
          </p>
        ) : (
          sessions.map((session) => {
            const active = Boolean(activeId) && session.id === activeId;
            return (
              <Link
                key={session.id}
                className={`flex flex-col gap-0.5 border-b border-foreground/8 px-4 py-3.5 transition ${
                  active
                    ? "border-l-[3px] border-l-brand bg-brand/10"
                    : "border-l-[3px] border-l-transparent hover:bg-panel/60"
                }`}
                href={`${basePath}/${session.id}?token=${encodeURIComponent(session.token)}${locale === "es" ? "&lang=es" : ""}`}
              >
                <span className="line-clamp-2 text-[11px] font-bold leading-4 uppercase">{session.productName}</span>
                <span className="text-[10px] text-foreground/40">{statusLabel(session.status, locale)}</span>
              </Link>
            );
          })
        )}
      </nav>
    </aside>
  );
}
