import { NextResponse } from "next/server";
import { rateLimit, requestClientKey, sameOrigin } from "@/lib/rate-limit";
import { storefrontRequest } from "@/lib/shopify/storefront";

type CartStatus = {
  cart: { id: string } | null;
};

function isShopifyCartId(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("gid://shopify/Cart/") && value.length <= 400;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ completed: false }, { status: 403 });
  const limited = rateLimit(`shopify-checkout-status:${requestClientKey(request)}`, 30, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ completed: false }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });
  }

  try {
    const body = await request.json() as { cartId?: unknown };
    if (!isShopifyCartId(body.cartId)) {
      return NextResponse.json({ completed: false }, { status: 400 });
    }

    const data = await storefrontRequest<CartStatus>(`
      query CheckoutCartStatus($id: ID!) {
        cart(id: $id) { id }
      }
    `, { id: body.cartId });

    return NextResponse.json({ completed: data.cart === null });
  } catch {
    return NextResponse.json({ completed: false }, { status: 503 });
  }
}
