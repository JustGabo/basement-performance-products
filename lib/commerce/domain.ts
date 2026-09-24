export type CurrencyCode = string;

export type StoreProduct = {
  id: string;
  slug: string;
  sku?: string;
  name: string;
  part: string;
  priceCents: number;
  currency: CurrencyCode;
  image: string;
  objectPosition: string;
  inventoryQuantity?: number;
  description?: string;
  compatibility?: string;
  images?: Array<{ url: string; alt: string }>;
};

export type CartLine = {
  product: StoreProduct;
  quantity: number;
};

export type OrderSummary = {
  id: string;
  number: string;
  status: string;
  paymentStatus: string;
  totalCents: number;
  currency: CurrencyCode;
  createdAt: string;
};
