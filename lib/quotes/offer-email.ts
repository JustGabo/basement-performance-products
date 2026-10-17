import { formatMoney, quoteCopy, type QuoteLocale } from "@/lib/quotes/copy";

export function buildQuoteReadyEmail(input: {
  locale: QuoteLocale;
  customerName: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  shippingCents: number;
  currency: string;
  chatUrl: string;
  invoiceUrl: string;
}) {
  const t = quoteCopy[input.locale];
  const productTotal = input.unitPriceCents * input.quantity;
  const total = productTotal + input.shippingCents;
  const fmt = (cents: number) => formatMoney(cents, input.currency, input.locale);

  const subject = t.emailSubject;
  const html = `
    <div style="font-family:Arial,sans-serif;background:#0a0a0a;color:#f5f5f5;padding:32px;">
      <p style="color:#f3b402;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;">Basement Performance Products</p>
      <h1 style="font-size:28px;line-height:1.1;margin:12px 0 8px;text-transform:uppercase;">${t.staffOfferIntro}</h1>
      <p style="color:#b3b3b3;line-height:1.6;max-width:520px;">${t.emailPreview}</p>
      <div style="margin:24px 0;padding:20px;border:1px solid #333;background:#111;">
        <p style="margin:0 0 8px;font-size:12px;color:#888;text-transform:uppercase;">${t.product}</p>
        <p style="margin:0 0 16px;font-size:16px;font-weight:700;">${input.productName} × ${input.quantity}</p>
        <p style="margin:0 0 4px;font-size:14px;">${t.shipping}: <strong>${fmt(input.shippingCents)}</strong></p>
        <p style="margin:0;font-size:16px;">${t.total}: <strong style="color:#f3b402;">${fmt(total)}</strong></p>
      </div>
      <p style="margin:0 0 16px;">
        <a href="${input.chatUrl}" style="display:inline-block;background:#f3b402;color:#000;text-decoration:none;font-weight:700;font-size:12px;letter-spacing:.06em;text-transform:uppercase;padding:14px 22px;margin-right:12px;">${input.locale === "es" ? "Ver cotización" : "View quote"}</a>
        <a href="${input.invoiceUrl}" style="display:inline-block;border:1px solid #f3b402;color:#f3b402;text-decoration:none;font-weight:700;font-size:12px;letter-spacing:.06em;text-transform:uppercase;padding:14px 22px;">${t.payNow}</a>
      </p>
      <p style="color:#666;font-size:11px;line-height:1.5;">Hi ${input.customerName},</p>
    </div>
  `.trim();

  return { subject, html };
}
