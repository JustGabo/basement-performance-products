import { NextResponse } from "next/server";
import { getConversationForToken, markCustomerRead } from "@/lib/quotes/server";
import { sameOrigin } from "@/lib/rate-limit";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const payload = (await request.json()) as { token?: string };
    const token = payload.token?.trim() ?? "";
    if (!token) {
      return NextResponse.json({ error: "Missing access token." }, { status: 400 });
    }

    const conversation = await getConversationForToken(id, token);
    if (!conversation) {
      return NextResponse.json({ error: "Quote not found." }, { status: 404 });
    }

    await markCustomerRead(conversation.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update read state." },
      { status: 500 },
    );
  }
}
