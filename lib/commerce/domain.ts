export type CurrencyCode = string;

export type StoreProduct = {
  id: string;
  merchandiseId?: string;
  slug: string;
  sku?: string;
  name: string;
  part: string;
  priceCents: number;
  currency: CurrencyCode;
  displayPriceCents?: number;
  displayCurrency?: CurrencyCode;
  marketCountry?: "US" | "DO";
  image: string;
  objectPosition: string;
  inventoryQuantity?: number;
  description?: string;
  productType?: string;
  vehicleMakes?: string[];
  compatibility?: string;
  material?: string[];
  finish?: string[];
  images?: Array<{ url: string; alt: string }>;
  categories?: Array<{ handle: string; title: string }>;
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
