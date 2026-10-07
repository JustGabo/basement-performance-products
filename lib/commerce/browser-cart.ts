import type { CartLine } from "./domain";

const STORAGE_KEY = "basement-cart-v2";
const LEGACY_STORAGE_KEY = "basement-cart-v1";
const PENDING_CHECKOUT_KEY = "basement-shopify-checkout";

export interface BrowserCartStorage {
  read(): CartLine[];
  write(lines: CartLine[]): void;
  clear(): void;
}

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Partial<CartLine>;

  return typeof line.quantity === "number"
    && line.quantity > 0
    && typeof line.product?.id === "string"
    && typeof line.product?.priceCents === "number";
}

function parseCart(value: string | null): CartLine[] {
  if (!value) return [];
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || !parsed.every(isCartLine)) return [];

  return parsed.map((line) => ({
    ...line,
    quantity: Math.min(99, Math.max(1, Math.trunc(line.quantity))),
    product: { ...line.product, currency: line.product.currency ?? "USD" },
  }));
}

export const localCartStorage: BrowserCartStorage = {
  read() {
    try {
      const current = window.localStorage.getItem(STORAGE_KEY);
      if (current) return parseCart(current);

      const legacy = parseCart(window.localStorage.getItem(LEGACY_STORAGE_KEY));
      if (legacy.length) {
        this.write(legacy);
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
      return legacy;
    } catch {
      this.clear();
      return [];
    }
  },
  write(lines) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  },
  clear() {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  },
};

const PENDING_CHECKOUT_TTL_MS = 10 * 24 * 60 * 60 * 1000;

export type PendingShopifyCheckout = {
  cartId: string;
  productIds: string[];
  startedAt: number;
};

function isPendingCheckout(value: unknown): value is PendingShopifyCheckout {
  if (!value || typeof value !== "object") return false;
  const pending = value as Partial<PendingShopifyCheckout>;
  return typeof pending.cartId === "string"
    && pending.cartId.startsWith("gid://shopify/Cart/")
    && Array.isArray(pending.productIds)
    && pending.productIds.every((id) => typeof id === "string")
    && typeof pending.startedAt === "number";
}

export function pendingCheckoutExpired(pending: PendingShopifyCheckout, now = Date.now()) {
  return now - pending.startedAt > PENDING_CHECKOUT_TTL_MS;
}

export function readPendingCheckout(): PendingShopifyCheckout | null {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(PENDING_CHECKOUT_KEY) ?? "null");
    return isPendingCheckout(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writePendingCheckout(pending: PendingShopifyCheckout) {
  window.localStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(pending));
}

export function clearPendingCheckout() {
  window.localStorage.removeItem(PENDING_CHECKOUT_KEY);
}
