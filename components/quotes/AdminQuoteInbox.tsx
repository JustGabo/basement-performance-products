"use client";

import Link from "next/link";
import { ArrowLeft, Maximize2 } from "lucide-react";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminQuoteChatPanel } from "@/components/quotes/AdminQuoteChatPanel";
import { AdminQuoteListSidebar, type AdminQuoteListItem } from "@/components/quotes/AdminQuoteListSidebar";
import { AdminQuoteOfferDialog } from "@/components/quotes/AdminQuoteOfferDialog";
import { QUOTE_EMBEDDED_SHELL_CLASS } from "@/lib/quotes/shell-layout";
import type { QuoteLocale } from "@/lib/quotes/copy";
import type { QuoteMessage } from "@/lib/quotes/message-types";

type ActiveConversation = {
  id: string;
  product_name: string;
  customer_name: string;
  customer_email: string;
  status: string;
  locale: string;
  country: string | null;
  city: string | null;
  currency: string;
  unit_price_cents: number | null;
  quantity: number;
  offer_shipping_cents: number | null;
  invoice_url: string | null;
};

export function AdminQuoteInbox({
  quotes,
  activeConversation,
  messages,
  feedback,
  hasShopifyAdmin,
  embedded = false,
  listBasePath = "/manage/quotes",
  backHref,
  fullscreenHref,
  showShopLink = true,
}: {
  quotes: AdminQuoteListItem[];
  activeConversation: ActiveConversation | null;
  messages: QuoteMessage[];
  feedback?: { error?: string; saved?: string };
  hasShopifyAdmin: boolean;
  embedded?: boolean;
  listBasePath?: string;
  backHref?: string;
  fullscreenHref?: string | null;
  showShopLink?: boolean;
}) {
  const activeId = activeConversation?.id ?? null;
  const locale: QuoteLocale = activeConversation?.locale === "es" ? "es" : "en";
  const productTotal = (activeConversation?.unit_price_cents ?? 0) * (activeConversation?.quantity ?? 1);
  const listOnly = !activeConversation;
  const listBackHref = backHref ?? listBasePath;
  const shellClass = embedded ? QUOTE_EMBEDDED_SHELL_CLASS : "flex h-dvh flex-col overflow-hidden bg-ink text-foreground";
  const rowClass = "flex min-h-0 flex-1 flex-col lg:flex-row lg:items-stretch";

  if (listOnly) {
    return (
      <div className={shellClass}>
        <div className={rowClass}>
          <AdminQuoteListSidebar
            quotes={quotes}
            activeId={null}
            showShopLink={showShopLink}
            basePath={listBasePath}
            className="h-full max-h-none w-full lg:flex"
          />
          <section className="hidden min-h-0 flex-1 flex-col items-center justify-center gap-2 px-6 text-center lg:flex">
            <p className="text-[10px] font-black tracking-[.14em] text-brand uppercase">International quotes</p>
            <h1 className="font-display text-3xl font-bold uppercase">Select a conversation</h1>
            <p className="max-w-md text-sm text-foreground/50">
              Choose a quote from the list to review shipping details, reply in chat, and send the Shopify checkout link.
            </p>
          </section>
        </div>
      </div>
    );
  }

  const defaultShipping = activeConversation.offer_shipping_cents
    ? (activeConversation.offer_shipping_cents / 100).toFixed(2)
    : "";

  return (
    <div className={shellClass}>
      <div className={rowClass}>
        <div className="hidden min-h-0 self-stretch lg:flex lg:h-full lg:w-[360px]">
          <AdminQuoteListSidebar
            quotes={quotes}
            activeId={activeId}
            showShopLink={showShopLink}
            basePath={listBasePath}
            className="h-full w-full"
          />
        </div>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-ink">
          <header className="flex shrink-0 items-center gap-2 border-b border-foreground/10 bg-panel/50 px-3 py-3 lg:gap-3 lg:px-4">
            <Link
              className="grid size-9 shrink-0 place-items-center text-foreground/70 hover:text-brand lg:hidden"
              href={listBackHref}
              aria-label="Back to quotes"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[15px] font-semibold leading-snug text-foreground">
                {activeConversation.product_name}
              </h1>
              <p className="truncate text-xs text-foreground/45">
                {activeConversation.customer_name} · {activeConversation.customer_email}
                {activeConversation.country ? ` · ${activeConversation.country}` : ""}
              </p>
            </div>
            {fullscreenHref ? (
              <Link
                className="grid size-9 shrink-0 place-items-center rounded-md border border-foreground/15 text-foreground/70 transition hover:border-brand hover:text-brand"
                href={fullscreenHref}
                target="_blank"
                rel="noreferrer"
                aria-label="Open full screen chat"
                title="Full screen"
              >
                <Maximize2 size={17} />
              </Link>
            ) : null}
            <AdminQuoteOfferDialog
              conversationId={activeConversation.id}
              locale={locale}
              productTotalCents={productTotal}
              currency={activeConversation.currency}
              defaultShippingDollars={defaultShipping}
              defaultInvoiceUrl={activeConversation.invoice_url ?? ""}
              adminApiConfigured={hasShopifyAdmin}
              redirectBase={listBasePath}
            />
          </header>

          {(feedback?.error || feedback?.saved) && (
            <div className="shrink-0 px-3 pt-2 lg:px-4">
              <AdminFeedback error={feedback.error} saved={feedback.saved} />
            </div>
          )}

          <AdminQuoteChatPanel
            conversationId={activeConversation.id}
            locale={locale}
            messages={messages}
            layout="full"
            redirectBase={listBasePath}
          />
        </section>
      </div>
    </div>
  );
}
