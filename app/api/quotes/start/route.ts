import { NextResponse } from "next/server";
import { createConversation, createConversationWithIntake, listMessages } from "@/lib/quotes/server";
import type { QuoteLocale } from "@/lib/quotes/copy";
import { rateLimit, requestClientKey, sameOrigin } from "@/lib/rate-limit";

type StartBody = {
  productSlug?: string;
  productName?: string;
  productPart?: string;
  merchandiseId?: string;
  variantSku?: string;
  unitPriceCents?: number;
  currency?: string;
  customerEmail?: string;
  customerName?: string;
  locale?: QuoteLocale;
  country?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  quantity?: number;
  phone?: string;
  notes?: string;
};

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const limited = rateLimit(`quote-start:${requestClientKey(request)}`, 6, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many quote requests. Try again later." }, {
      status: 429,
      headers: { "Retry-After": String(limited.retryAfter) },
    });
  }

  try {
    const body = (await request.json()) as StartBody;
    const email = body.customerEmail?.trim().toLowerCase() ?? "";
    const name = body.customerName?.trim() ?? "";
    const productSlug = body.productSlug?.trim() ?? "";
    const productName = body.productName?.trim() ?? "";

    if (!email || !email.includes("@") || !name || !productSlug || !productName) {
      return NextResponse.json({ error: "Email, name, and product are required." }, { status: 400 });
    }

    const locale: QuoteLocale = body.locale === "es" ? "es" : "en";
    const country = body.country?.trim() ?? "";
    const city = body.city?.trim() ?? "";
    const postalCode = body.postalCode?.trim() ?? "";
    const quantity = Number(body.quantity ?? 1);
    const hasIntake = Boolean(country && city && postalCode);

    if (hasIntake && (!Number.isFinite(quantity) || quantity < 1 || quantity > 99)) {
      return NextResponse.json({ error: "Complete all required shipping fields." }, { status: 400 });
    }

    const conversationInput = {
      productSlug,
      productName,
      productPart: body.productPart,
      merchandiseId: body.merchandiseId,
      variantSku: body.variantSku,
      unitPriceCents: body.unitPriceCents,
      currency: body.currency,
      customerEmail: email,
      customerName: name,
      locale,
    };

    const conversation = hasIntake
      ? await createConversationWithIntake(conversationInput, {
          country: country.toUpperCase(),
          city,
          region: body.region,
          postalCode,
          quantity,
          phone: body.phone,
          notes: body.notes,
        })
      : await createConversation(conversationInput);

    const messages = await listMessages(conversation.id);
    return NextResponse.json({
      conversationId: conversation.id,
      accessToken: conversation.access_token,
      status: conversation.status,
      messages,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not start quote chat." },
      { status: 500 },
    );
  }
}
