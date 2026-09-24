import type { CartLine, OrderSummary, StoreProduct } from "./domain";

export interface CatalogRepository {
  listProducts(): Promise<StoreProduct[]>;
  getProductBySlug(slug: string): Promise<StoreProduct | null>;
}

export interface CartRepository {
  getActiveCart(): Promise<CartLine[]>;
  replaceCart(lines: CartLine[]): Promise<void>;
  clearCart(): Promise<void>;
}

export interface OrderRepository {
  listCustomerOrders(): Promise<OrderSummary[]>;
  getCustomerOrder(orderId: string): Promise<OrderSummary | null>;
}

export interface PaymentGateway {
  createCheckout(input: { cartId: string; returnUrl: string }): Promise<{ checkoutUrl: string }>;
  verifyPayment(providerOrderId: string): Promise<{ paid: boolean; providerCaptureId?: string }>;
}
