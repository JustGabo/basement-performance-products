import { NextResponse } from "next/server";
import { getConversationForToken, listMessages } from "@/lib/quotes/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const token = new URL(request.url).searchParams.get("token")?.trim() ?? "";
  if (!token) {
    return NextResponse.json({ error: "Missing access token." }, { status: 400 });
  }

  try {
    const conversation = await getConversationForToken(id, token);
    if (!conversation) {
      return NextResponse.json({ error: "Quote not found." }, { status: 404 });
    }
    const messages = await listMessages(conversation.id);
    return NextResponse.json({
      conversation: {
        id: conversation.id,
        status: conversation.status,
        productName: conversation.product_name,
        productPart: conversation.product_part,
        locale: conversation.locale,
        quantity: conversation.quantity,
        unitPriceCents: conversation.unit_price_cents,
        currency: conversation.currency,
        offerShippingCents: conversation.offer_shipping_cents,
        invoiceUrl: conversation.invoice_url,
      },
      messages,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load quote." },
      { status: 500 },
    );
  }
}
