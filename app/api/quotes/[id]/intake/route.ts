import { NextResponse } from "next/server";
import { getConversationForToken, listMessages, submitIntake } from "@/lib/quotes/server";
import { rateLimit, requestClientKey, sameOrigin } from "@/lib/rate-limit";

type IntakeBody = {
  token?: string;
  country?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  quantity?: number;
  phone?: string;
  notes?: string;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const limited = rateLimit(`quote-intake:${requestClientKey(request)}`, 12, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many submissions." }, { status: 429 });
  }

  const { id } = await context.params;

  try {
    const body = (await request.json()) as IntakeBody;
    const token = body.token?.trim() ?? "";
    const country = body.country?.trim() ?? "";
    const city = body.city?.trim() ?? "";
    const postalCode = body.postalCode?.trim() ?? "";
    const quantity = Number(body.quantity ?? 1);

    if (!token || !country || !city || !postalCode || !Number.isFinite(quantity) || quantity < 1 || quantity > 99) {
      return NextResponse.json({ error: "Complete all required shipping fields." }, { status: 400 });
    }

    const conversation = await getConversationForToken(id, token);
    if (!conversation) {
      return NextResponse.json({ error: "Quote not found." }, { status: 404 });
    }
    if (conversation.status !== "collecting") {
      return NextResponse.json({ error: "Shipping details were already submitted." }, { status: 409 });
    }

    await submitIntake(conversation, {
      country,
      city,
      region: body.region,
      postalCode,
      quantity,
      phone: body.phone,
      notes: body.notes,
    });

    const messages = await listMessages(id);
    return NextResponse.json({ ok: true, messages });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not submit details." },
      { status: 500 },
    );
  }
}
