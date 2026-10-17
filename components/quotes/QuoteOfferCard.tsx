"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatMoney, quoteCopy, type QuoteLocale } from "@/lib/quotes/copy";

function LineItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="shrink-0 text-[10px] font-bold tracking-[.06em] text-foreground/45 uppercase">{label}</span>
      <span className="text-right font-medium text-foreground/85 tabular-nums">{value}</span>
    </div>
  );
}

export function QuoteOfferCard({
  locale,
  payload,
}: {
  locale: QuoteLocale;
  payload: {
    productName: string;
    quantity: number;
    unitPriceCents: number;
    shippingCents: number;
    totalCents: number;
    currency: string;
    invoiceUrl: string;
  };
}) {
  const t = quoteCopy[locale];
  const productTotal = payload.unitPriceCents * payload.quantity;
  const checkoutHint =
    locale === "es" ? "Checkout seguro en Shopify" : "Secure Shopify checkout";

  return (
    <article className="overflow-hidden rounded-xl border border-brand/35 bg-linear-to-b from-brand/12 via-panel/40 to-ink/90 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]">
      <div className="border-b border-brand/20 bg-brand/10 px-4 py-2.5">
        <span className="text-[9px] font-black tracking-[.16em] text-brand uppercase">{t.offerLabel}</span>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4">
        <h3 className="font-display text-lg leading-snug font-bold text-foreground uppercase">{payload.productName}</h3>

        <div className="flex flex-col gap-2.5">
          <LineItem
            label={t.product}
            value={`${formatMoney(productTotal, payload.currency, locale)} · ${payload.quantity}×`}
          />
          <LineItem label={t.shipping} value={formatMoney(payload.shippingCents, payload.currency, locale)} />
        </div>

        <div className="flex items-baseline justify-between gap-4 border-t border-foreground/10 pt-3">
          <span className="text-[10px] font-black tracking-[.1em] text-foreground/50 uppercase">{t.total}</span>
          <span className="font-display text-2xl font-bold text-brand tabular-nums">
            {formatMoney(payload.totalCents, payload.currency, locale)}
          </span>
        </div>

        <Link
          className="group inline-flex min-h-12 items-center justify-between gap-3 rounded-md bg-brand px-4 text-[10px] font-black text-black uppercase transition hover:bg-[#d99f00] active:scale-[0.99]"
          href={payload.invoiceUrl}
          target="_blank"
          rel="noreferrer"
        >
          <span>{t.payNow}</span>
          <ArrowUpRight
            className="shrink-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            size={18}
            strokeWidth={2.5}
          />
        </Link>

        <p className="text-center text-[10px] text-foreground/35">{checkoutHint}</p>
      </div>
    </article>
  );
}
