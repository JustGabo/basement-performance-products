"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Maximize2 } from "lucide-react";
import { QUOTE_EMBEDDED_SHELL_CLASS } from "@/lib/quotes/shell-layout";
import { QuoteChat } from "@/components/quotes/QuoteChat";
import { QuoteSessionsSidebar } from "@/components/quotes/QuoteSessionsSidebar";
import {
  listQuoteSessions,
  saveQuoteSession,
  touchQuoteSession,
  type SavedQuoteSession,
} from "@/lib/quotes/client-sessions";
import type { QuoteLocale } from "@/lib/quotes/copy";

type ConversationMeta = {
  id: string;
  status: string;
  productName: string;
  locale: string;
};

function statusSubtitle(status: string | undefined, locale: QuoteLocale) {
  switch (status) {
    case "quoted":
      return locale === "es" ? "Cotización lista · Basement" : "Quote ready · Basement";
    case "reviewing":
      return locale === "es" ? "En revisión · Basement" : "Under review · Basement";
    case "collecting":
      return locale === "es" ? "Completa tus datos · Basement" : "Complete your details · Basement";
    case "closed":
      return locale === "es" ? "Conversación cerrada" : "Conversation closed";
    default:
      return locale === "es" ? "Cotización internacional · Basement" : "International quote · Basement";
  }
}

export function QuoteConversationShell({
  conversationId,
  accessToken,
  fallbackLocale,
  basePath = "/quotes",
  embedded = false,
}: {
  conversationId: string;
  accessToken: string;
  fallbackLocale: QuoteLocale;
  basePath?: string;
  embedded?: boolean;
}) {
  const [sessions, setSessions] = useState<SavedQuoteSession[]>([]);
  const [meta, setMeta] = useState<ConversationMeta | null>(null);
  const [locale, setLocale] = useState<QuoteLocale>(fallbackLocale);

  useEffect(() => {
    const existing = listQuoteSessions().find((item) => item.id === conversationId);
    saveQuoteSession({
      id: conversationId,
      token: accessToken,
      productName: existing?.productName ?? "Quote",
      status: existing?.status,
      updatedAt: new Date().toISOString(),
    });
    setSessions(listQuoteSessions());
  }, [accessToken, conversationId]);

  const onConversationMeta = useCallback(
    (next: ConversationMeta) => {
      setMeta((prev) => {
        if (prev?.productName === next.productName && prev?.status === next.status) {
          return prev;
        }
        touchQuoteSession(conversationId, {
          productName: next.productName,
          status: next.status,
        });
        setSessions(listQuoteSessions());
        return next;
      });
      const nextLocale: QuoteLocale = next.locale === "es" ? "es" : "en";
      setLocale((prev) => (prev === nextLocale ? prev : nextLocale));
    },
    [conversationId],
  );

  const contactTitle = meta?.productName ?? (locale === "es" ? "Tu cotización" : "Your quote");
  const listHref =
    locale === "es" ? `${basePath}?lang=es` : basePath;

  const fullscreenHref = `${basePath === "/account/quotes" ? "/quotes" : basePath}/${conversationId}?token=${encodeURIComponent(accessToken)}${locale === "es" ? "&lang=es" : ""}`;

  const content = (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:items-stretch">
        <div className="hidden min-h-0 self-stretch lg:flex lg:h-full lg:w-[360px]">
          <QuoteSessionsSidebar
            sessions={sessions}
            activeId={conversationId}
            locale={locale}
            showShopLink={!embedded}
            basePath={basePath}
            className="h-full w-full"
          />
        </div>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-ink">
          <header className="flex shrink-0 items-center gap-3 border-b border-foreground/10 bg-panel/50 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))] lg:px-5 lg:pt-3">
            <Link
              className="grid size-9 shrink-0 place-items-center text-foreground/70 hover:text-brand lg:hidden"
              href={listHref}
              aria-label={locale === "es" ? "Volver a cotizaciones" : "Back to quotes"}
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[15px] font-semibold leading-snug text-foreground">{contactTitle}</h1>
              <p className="truncate text-xs text-foreground/45">{statusSubtitle(meta?.status, locale)}</p>
            </div>
            {embedded ? (
              <Link
                className="grid size-9 shrink-0 place-items-center rounded-md border border-foreground/15 text-foreground/70 transition hover:border-brand hover:text-brand"
                href={fullscreenHref}
                target="_blank"
                rel="noreferrer"
                aria-label={locale === "es" ? "Pantalla completa" : "Full screen"}
                title={locale === "es" ? "Pantalla completa" : "Full screen"}
              >
                <Maximize2 size={17} />
              </Link>
            ) : null}
          </header>

          <QuoteChat
            conversationId={conversationId}
            accessToken={accessToken}
            locale={locale}
            layout="full"
            onConversationMeta={onConversationMeta}
          />
        </section>
      </div>
  );

  if (embedded) {
    return <div className={QUOTE_EMBEDDED_SHELL_CLASS}>{content}</div>;
  }

  return <main className="flex h-dvh flex-col overflow-hidden bg-ink text-foreground">{content}</main>;
}
