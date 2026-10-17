"use client";

import { sendQuoteOffer } from "@/app/manage/quotes/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatMoney, type QuoteLocale } from "@/lib/quotes/copy";

export function AdminQuoteOfferDialog({
  conversationId,
  locale,
  productTotalCents,
  currency,
  defaultShippingDollars,
  defaultInvoiceUrl,
  adminApiConfigured,
}: {
  conversationId: string;
  locale: QuoteLocale;
  productTotalCents: number;
  currency: string;
  defaultShippingDollars: string;
  defaultInvoiceUrl: string;
  adminApiConfigured: boolean;
}) {
  const inputClass =
    "min-h-11 border border-foreground/15 bg-ink px-3 text-sm normal-case outline-none focus:border-brand";
  const labelClass = "flex flex-col gap-1 text-[10px] font-bold uppercase";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="shrink-0 cursor-pointer bg-brand px-3 py-2 text-[9px] font-black tracking-[.04em] text-black uppercase hover:bg-[#d99f00] max-lg:px-2.5"
          type="button"
        >
          Send quote + email
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto border-foreground/15 bg-panel text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold uppercase">Send quote + email</DialogTitle>
          <DialogDescription className="text-xs text-foreground/50">
            Catalog line {formatMoney(productTotalCents, currency, locale)} · customer receives chat update and email.
          </DialogDescription>
        </DialogHeader>
        <form action={sendQuoteOffer} className="flex flex-col gap-3">
          <input name="conversation_id" type="hidden" value={conversationId} />
          <label className={labelClass}>
            International shipping (USD)
            <input
              className={inputClass}
              name="shipping_dollars"
              type="number"
              min={0}
              step="0.01"
              defaultValue={defaultShippingDollars}
              required
            />
          </label>
          <label className={labelClass}>
            Shopify invoice URL {adminApiConfigured ? "(optional override)" : "(required without Admin API)"}
            <input
              className={inputClass}
              name="manual_invoice_url"
              type="url"
              placeholder="https://checkout.shopify.com/..."
              defaultValue={defaultInvoiceUrl}
            />
          </label>
          <label className={labelClass}>
            Note (optional)
            <textarea className={`${inputClass} min-h-20 py-2`} name="staff_note" />
          </label>
          <button className="min-h-12 cursor-pointer bg-brand text-[10px] font-black text-black uppercase" type="submit">
            Send quote + email
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
