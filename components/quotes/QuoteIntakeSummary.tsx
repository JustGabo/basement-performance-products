"use client";

import { quoteCopy, type QuoteLocale } from "@/lib/quotes/copy";

export type IntakePayload = {
  kind?: string;
  country?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  quantity?: number | null;
  name?: string | null;
  phone?: string | null;
  notes?: string | null;
};

export function QuoteIntakeSummary({
  locale,
  payload,
  tone = "outgoing",
}: {
  locale: QuoteLocale;
  payload: IntakePayload;
  tone?: "outgoing" | "incoming";
}) {
  const labelClass =
    tone === "outgoing" ? "text-[10px] font-bold tracking-[.06em] text-foreground/50 uppercase" : "text-[10px] font-bold tracking-[.06em] text-foreground/45 uppercase";
  const valueClass = tone === "outgoing" ? "font-medium text-foreground" : "font-medium text-foreground/90";
  const t = quoteCopy[locale];
  const rows = [
    payload.country ? { label: t.country, value: payload.country } : null,
    payload.city ? { label: t.city, value: payload.city } : null,
    payload.postalCode ? { label: t.postalCode, value: payload.postalCode } : null,
    payload.quantity ? { label: t.quantity, value: String(payload.quantity) } : null,
    payload.name ? { label: t.fullName, value: payload.name } : null,
    payload.phone ? { label: t.phone.replace(" (optional)", "").replace(" (opcional)", ""), value: payload.phone } : null,
    payload.notes ? { label: t.notes.replace(" (optional)", "").replace(" (opcional)", ""), value: payload.notes } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <dl className="flex flex-col gap-3 text-sm">
      {rows.map((row) => (
        <div className="flex flex-col gap-0.5" key={row.label}>
          <dt className={labelClass}>{row.label}</dt>
          <dd className={`m-0 ${valueClass}`}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
