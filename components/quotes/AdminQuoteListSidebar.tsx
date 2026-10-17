"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "cn";
import {
  filterAdminQuotes,
  parseAdminInboxTab,
  type AdminInboxTab,
} from "@/lib/quotes/admin-inbox-filter";
import type { QuoteLocale } from "@/lib/quotes/copy";
import { QuoteUnreadDot } from "@/components/quotes/QuoteUnreadDot";

export type AdminQuoteListItem = {
  id: string;
  product_name: string;
  customer_name: string;
  status: string;
  unread?: boolean;
};

function statusLabel(status: string, locale: QuoteLocale) {
  switch (status) {
    case "quoted":
      return locale === "es" ? "Lista" : "Ready";
    case "reviewing":
      return locale === "es" ? "En revisión" : "Reviewing";
    case "collecting":
      return locale === "es" ? "Pendiente" : "Pending";
    case "closed":
      return locale === "es" ? "Cerrada" : "Closed";
    default:
      return status;
  }
}

const tabLabels: Record<AdminInboxTab, { en: string; es: string }> = {
  pending: { en: "Pending", es: "Pendientes" },
  all: { en: "All", es: "Todas" },
  resolved: { en: "Resolved", es: "Resueltas" },
};

export function AdminQuoteListSidebar({
  quotes,
  activeId,
  showShopLink = false,
  basePath = "/manage/quotes",
  className,
  locale = "en",
  showInboxTabs = true,
}: {
  quotes: AdminQuoteListItem[];
  activeId: string | null;
  showShopLink?: boolean;
  basePath?: string;
  className?: string;
  locale?: QuoteLocale;
  showInboxTabs?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseAdminInboxTab(searchParams.get("tab") ?? undefined);
  const filtered = filterAdminQuotes(quotes, tab);

  const setTab = (next: AdminInboxTab) => {
    const params = new URLSearchParams();
    if (next !== "pending") params.set("tab", next);
    const lang = searchParams.get("lang");
    if (lang === "es") params.set("lang", "es");
    const query = params.toString();
    router.replace(query ? `${basePath}?${query}` : basePath, { scroll: false });
  };

  const hrefForQuote = (quoteId: string) => {
    const params = new URLSearchParams();
    if (tab !== "pending") params.set("tab", tab);
    const lang = searchParams.get("lang");
    if (lang === "es") params.set("lang", "es");
    const query = params.toString();
    return query ? `${basePath}/${quoteId}?${query}` : `${basePath}/${quoteId}`;
  };

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-full shrink-0 flex-col self-stretch border-foreground/10 bg-panel/40 lg:w-[360px] lg:border-r",
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
        <p className="text-[10px] font-black tracking-[.14em] text-brand uppercase">
          {locale === "es" ? "Cotizaciones" : "Shipping quotes"}
        </p>
        <p className="mt-1 text-xs text-foreground/45">
          {locale === "es" ? "Bandeja de envío internacional" : "International quote inbox"}
        </p>
        {showInboxTabs ? (
          <div className="mt-3 grid grid-cols-3 gap-1 border border-foreground/12 bg-ink p-1">
            {(["pending", "all", "resolved"] as const).map((key) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  className={`min-h-9 cursor-pointer px-1 text-[9px] font-black tracking-[.04em] uppercase transition ${
                    active ? "bg-brand text-black" : "text-foreground/55 hover:text-foreground"
                  }`}
                  type="button"
                  onClick={() => setTab(key)}
                >
                  {tabLabels[key][locale]}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      <nav className="quote-sidebar-scroll flex min-h-0 flex-1 flex-col overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-xs leading-5 text-foreground/45">
            {locale === "es" ? "No hay cotizaciones en esta vista." : "No quotes in this view."}
          </p>
        ) : (
          filtered.map((quote) => {
            const active = activeId === quote.id;
            return (
              <Link
                key={quote.id}
                className={`flex flex-col gap-0.5 border-b border-foreground/8 px-4 py-3.5 transition ${
                  active
                    ? "border-l-[3px] border-l-brand bg-brand/10"
                    : "border-l-[3px] border-l-transparent hover:bg-panel/60"
                }`}
                href={hrefForQuote(quote.id)}
              >
                <span className="flex items-start gap-2">
                  <span className="line-clamp-2 min-w-0 flex-1 text-[11px] font-bold leading-4 uppercase">
                    {quote.product_name}
                  </span>
                  {quote.unread ? <QuoteUnreadDot className="mt-1" /> : null}
                </span>
                <span className="truncate text-[10px] text-foreground/45">{quote.customer_name}</span>
                <span className="text-[10px] text-foreground/40">{statusLabel(quote.status, locale)}</span>
              </Link>
            );
          })
        )}
      </nav>
    </aside>
  );
}
