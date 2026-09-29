import { NextResponse } from "next/server";
import { storefrontRequest } from "@/lib/shopify/storefront";

type CheckoutBody = {
  items?: Array<{ merchandiseId?: string; quantity?: number }>;
  buyer?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    line1?: string;
    line2?: string;
    city?: string;
    stateRegion?: string;
    postalCode?: string;
    countryCode?: string;
  };
};

type CartCreatePayload = {
  cartCreate: {
    cart: { id: string; checkoutUrl: string } | null;
    userErrors: Array<{ field: string[] | null; message: string }>;
  };
};

export async function POST(request: Request) {
  try {
    const body = await request.json() as CheckoutBody;
    const countryCode = body.buyer?.countryCode?.toUpperCase();
    if (countryCode !== "US" && countryCode !== "DO") {
      return NextResponse.json({ error: "Select a supported delivery country." }, { status: 400 });
    }

    const lines = (body.items ?? []).map((item) => ({
      merchandiseId: item.merchandiseId,
      quantity: Math.min(99, Math.max(1, Math.trunc(item.quantity ?? 1))),
    }));
    if (!lines.length || lines.some((line) => !line.merchandiseId?.startsWith("gid://shopify/ProductVariant/"))) {
      return NextResponse.json({ error: "Your cart contains an item that is not available in Shopify." }, { status: 400 });
    }

    const buyer = body.buyer ?? {};
    const hasAddress = Boolean(buyer.line1 && buyer.city && buyer.firstName && buyer.lastName);
    const data = await storefrontRequest<CartCreatePayload>(`
      mutation CreateCheckoutCart($input: CartInput!, $country: CountryCode!) @inContext(country: $country) {
        cartCreate(input: $input) {
          cart { id checkoutUrl }
          userErrors { field message }
        }
      }
    `, {
      country: countryCode,
      input: {
        lines,
        buyerIdentity: {
          countryCode,
          email: buyer.email || undefined,
          phone: buyer.phone || undefined,
          deliveryAddressPreferences: hasAddress ? [{
            deliveryAddress: {
              firstName: buyer.firstName,
              lastName: buyer.lastName,
              address1: buyer.line1,
              address2: buyer.line2 || undefined,
              city: buyer.city,
              province: buyer.stateRegion || undefined,
              zip: buyer.postalCode || undefined,
              country: countryCode === "DO" ? "Dominican Republic" : "United States",
              phone: buyer.phone || undefined,
            },
          }] : undefined,
        },
      },
    });

    const errors = data.cartCreate.userErrors;
    if (errors.length || !data.cartCreate.cart?.checkoutUrl) {
      return NextResponse.json({ error: errors.map((error) => error.message).join(" ") || "Shopify could not create checkout." }, { status: 400 });
    }

    return NextResponse.json(data.cartCreate.cart);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Shopify checkout failed." }, { status: 500 });
  }
}
