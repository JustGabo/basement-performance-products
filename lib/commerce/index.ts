export type { CartLine, CurrencyCode, OrderSummary, StoreProduct } from "./domain";
export type { CartRepository, CatalogRepository, OrderRepository, PaymentGateway } from "./ports";

export function formatPrice(priceCents: number, locale = "en-US", currency = "USD") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}
