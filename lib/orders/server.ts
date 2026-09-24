import "server-only";

import { createClient } from "@/lib/supabase/server";

export type CustomerOrderDetail = {
  id: string;
  order_number: string;
  email: string;
  phone: string | null;
  status: string;
  payment_status: string;
  currency: string;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  discount_cents: number;
  total_cents: number;
  shipping_address: Record<string, unknown>;
  placed_at: string | null;
  created_at: string;
  order_items: Array<{
    id: string;
    product_name: string;
    product_description: string | null;
    image_url: string | null;
    unit_price_cents: number;
    quantity: number;
    line_total_cents: number;
  }>;
};

export async function getCustomerOrder(orderId: string) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return { userId: null, order: null };

  const { data } = await supabase.from("orders").select("id, order_number, email, phone, status, payment_status, currency, subtotal_cents, shipping_cents, tax_cents, discount_cents, total_cents, shipping_address, placed_at, created_at, order_items(id, product_name, product_description, image_url, unit_price_cents, quantity, line_total_cents)").eq("id", orderId).eq("user_id", userId).maybeSingle();
  return { userId, order: data as CustomerOrderDetail | null };
}
