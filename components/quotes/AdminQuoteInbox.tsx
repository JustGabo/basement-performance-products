"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminQuoteChatPanel } from "@/components/quotes/AdminQuoteChatPanel";
import { AdminQuoteListSidebar, type AdminQuoteListItem } from "@/components/quotes/AdminQuoteListSidebar";
import { AdminQuoteOfferDialog } from "@/components/quotes/AdminQuoteOfferDialog";
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
}: {
  quotes: AdminQuoteListItem[];
  activeConversation: ActiveConversation | null;
  messages: QuoteMessage[];
  feedback?: { error?: string; saved?: string };
  hasShopifyAdmin: boolean;
}) {
  const activeId = activeConversation?.id ?? null;
  const locale: QuoteLocale = activeConversation?.locale === "es" ? "es" : "en";
  const productTotal = (activeConversation?.unit_price_cents ?? 0) * (activeConversation?.quantity ?? 1);
  const listOnly = !activeConversation;

  if (listOnly) {
    return (
      <main className="flex h-dvh flex-col overflow-hidden bg-ink text-foreground">
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <AdminQuoteListSidebar quotes={quotes} activeId={null} showShopLink className="h-full max-h-none lg:flex" />
          <section className="hidden min-h-0 flex-1 flex-col items-center justify-center gap-2 px-6 text-center lg:flex">
            <p className="text-[10px] font-black tracking-[.14em] text-brand uppercase">International quotes</p>
            <h1 className="font-display text-3xl font-bold uppercase">Select a conversation</h1>
            <p className="max-w-md text-sm text-foreground/50">
              Choose a quote from the list to review shipping details, reply in chat, and send the Shopify checkout link.
            </p>
          </section>
        </div>
      </main>
    );
  }

  const defaultShipping = activeConversation.offer_shipping_cents
    ? (activeConversation.offer_shipping_cents / 100).toFixed(2)
    : "";

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-ink text-foreground">
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="hidden min-h-0 lg:flex lg:h-full">
          <AdminQuoteListSidebar quotes={quotes} activeId={activeId} showShopLink />
        </div>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-ink">
          <header className="flex shrink-0 items-center gap-2 border-b border-foreground/10 bg-panel/50 px-3 py-3 lg:gap-3 lg:px-4">
            <Link
              className="grid size-9 shrink-0 place-items-center text-foreground/70 hover:text-brand lg:hidden"
              href="/manage/quotes"
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
            <AdminQuoteOfferDialog
              conversationId={activeConversation.id}
              locale={locale}
              productTotalCents={productTotal}
              currency={activeConversation.currency}
              defaultShippingDollars={defaultShipping}
              defaultInvoiceUrl={activeConversation.invoice_url ?? ""}
              adminApiConfigured={hasShopifyAdmin}
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
          />
        </section>
      </div>
    </main>
  );
}
