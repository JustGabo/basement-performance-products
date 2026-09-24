import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/commerce/server";
import { paypalRequest } from "@/lib/paypal/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type AddressInput = {
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  stateRegion: string;
  postalCode: string;
  countryCode: string;
};

type CreateOrderBody = {
  items?: Array<{ productId?: string; quantity?: number }>;
  shipping?: AddressInput;
};

type PayPalOrder = { id: string; status: string };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const money = (cents: number) => (cents / 100).toFixed(2);

function validAddress(address?: AddressInput): address is AddressInput {
  return Boolean(address
    && address.firstName.trim()
    && address.lastName.trim()
    && address.phone.trim()
    && address.line1.trim()
    && address.city.trim()
    && address.countryCode.trim().length === 2);
}

export async function POST(request: Request) {
  let localOrderId: string | null = null;
  try {
    const supabase = await createClient();
    const { data: claimsData, error: authError } = await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;
    const email = typeof claimsData?.claims?.email === "string" ? claimsData.claims.email : "";
    if (authError || !userId || !email) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const body = await request.json() as CreateOrderBody;
    if (!body.items?.length || !validAddress(body.shipping)) return NextResponse.json({ error: "Cart and shipping information are required." }, { status: 400 });

    const requested = new Map<string, number>();
    for (const item of body.items) {
      if (!item.productId || !Number.isInteger(item.quantity) || Number(item.quantity) < 1 || Number(item.quantity) > 99) {
        return NextResponse.json({ error: "Invalid cart item." }, { status: 400 });
      }
      requested.set(item.productId, (requested.get(item.productId) ?? 0) + Number(item.quantity));
    }

    const catalog = await getCatalog();
    const products = await catalog.listProducts();
    const lines = [...requested.entries()].map(([productId, quantity]) => {
      const product = products.find((candidate) => candidate.id === productId);
      if (!product) throw new Error("A product in your cart is no longer available.");
      if (product.currency !== "USD") throw new Error("All checkout items must use USD.");
      if (product.inventoryQuantity !== undefined && product.inventoryQuantity < quantity) throw new Error(`${product.name} does not have enough stock.`);
      return { product, quantity, lineTotal: product.priceCents * quantity };
    });

    const subtotalCents = lines.reduce((total, line) => total + line.lineTotal, 0);
    const shippingCents = 0;
    const totalCents = subtotalCents + shippingCents;
    const shippingAddress = {
      recipient_name: `${body.shipping.firstName.trim()} ${body.shipping.lastName.trim()}`,
      line_1: body.shipping.line1.trim(),
      line_2: body.shipping.line2?.trim() || null,
      city: body.shipping.city.trim(),
      state_region: body.shipping.stateRegion.trim() || null,
      postal_code: body.shipping.postalCode.trim() || null,
      country_code: body.shipping.countryCode.trim().toUpperCase(),
      phone: body.shipping.phone.trim(),
    };

    const admin = createAdminClient();
    const { data: localOrder, error: orderError } = await admin.from("orders").insert({
      user_id: userId,
      email,
      phone: body.shipping.phone.trim(),
      status: "payment_pending",
      payment_status: "pending",
      currency: "USD",
      subtotal_cents: subtotalCents,
      shipping_cents: shippingCents,
      tax_cents: 0,
      discount_cents: 0,
      total_cents: totalCents,
      shipping_address: shippingAddress,
      billing_address: shippingAddress,
    }).select("id, order_number").single();
    if (orderError || !localOrder) throw new Error(orderError?.message ?? "Could not create the local order.");
    localOrderId = localOrder.id;

    const { error: itemError } = await admin.from("order_items").insert(lines.map(({ product, quantity, lineTotal }) => ({
      order_id: localOrder.id,
      product_id: uuidPattern.test(product.id) ? product.id : null,
      sku: product.sku ?? product.id,
      product_name: product.name,
      product_description: product.part,
      image_url: product.image,
      unit_price_cents: product.priceCents,
      quantity,
      line_total_cents: lineTotal,
    })));
    if (itemError) throw new Error(itemError.message);

    const paypalOrder = await paypalRequest<PayPalOrder>("/v2/checkout/orders", {
      method: "POST",
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: localOrder.id,
          custom_id: localOrder.id,
          invoice_id: localOrder.order_number,
          description: "Basement Performance Products order",
          items: lines.map(({ product, quantity }) => ({
            name: product.name.slice(0, 127),
            description: product.part.slice(0, 127),
            sku: (product.sku ?? product.id).slice(0, 127),
            quantity: String(quantity),
            unit_amount: { currency_code: "USD", value: money(product.priceCents) },
            category: "PHYSICAL_GOODS",
          })),
          amount: {
            currency_code: "USD",
            value: money(totalCents),
            breakdown: {
              item_total: { currency_code: "USD", value: money(subtotalCents) },
              shipping: { currency_code: "USD", value: money(shippingCents) },
            },
          },
          shipping: {
            name: { full_name: shippingAddress.recipient_name },
            address: {
              address_line_1: shippingAddress.line_1,
              address_line_2: shippingAddress.line_2 ?? undefined,
              admin_area_2: shippingAddress.city,
              admin_area_1: shippingAddress.state_region ?? undefined,
              postal_code: shippingAddress.postal_code ?? undefined,
              country_code: shippingAddress.country_code,
            },
          },
        }],
      }),
    });

    const { error: paymentError } = await admin.from("payments").insert({
      order_id: localOrder.id,
      provider: "paypal",
      provider_order_id: paypalOrder.id,
      status: "pending",
      amount_cents: totalCents,
      currency: "USD",
      provider_payload: { create_status: paypalOrder.status },
    });
    if (paymentError) throw new Error(paymentError.message);

    return NextResponse.json({ orderId: paypalOrder.id, localOrderId: localOrder.id });
  } catch (error) {
    if (localOrderId) {
      const admin = createAdminClient();
      await admin.from("orders").update({ status: "cancelled", payment_status: "failed" }).eq("id", localOrderId);
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create the order." }, { status: 500 });
  }
}
