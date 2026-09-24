import type { CartLine } from "./domain";

const STORAGE_KEY = "basement-cart-v2";
const LEGACY_STORAGE_KEY = "basement-cart-v1";

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
