export type { CartLine, CurrencyCode, OrderSummary, StoreProduct } from "./domain";
export type { CartRepository, CatalogRepository, OrderRepository, PaymentGateway } from "./ports";

export function formatPrice(priceCents: number, locale = "en-US", currency = "USD") {
  const hasCents = priceCents % 100 !== 0;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(priceCents / 100);
}

export function formatProductPrice(
  product: import("./domain").StoreProduct,
  quantity = 1,
  locale?: string,
) {
  const currency = product.displayCurrency ?? product.currency;
  const priceCents = product.displayPriceCents ?? product.priceCents;
  const resolvedLocale = locale ?? (currency === "DOP" ? "es-DO" : "en-US");
  return formatPrice(priceCents * quantity, resolvedLocale, currency);
}

export function formatCartPrice(lines: import("./domain").CartLine[], locale?: string) {
  const currency = lines[0]?.product.displayCurrency ?? lines[0]?.product.currency ?? "USD";
  const total = lines.reduce(
    (sum, line) => sum + (line.product.displayPriceCents ?? line.product.priceCents) * line.quantity,
    0,
  );
  return formatPrice(total, locale ?? (currency === "DOP" ? "es-DO" : "en-US"), currency);
}
