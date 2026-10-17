import { NextResponse } from "next/server";
import { getConversationForToken, listMessages, sendCustomerMessage } from "@/lib/quotes/server";
import { rateLimit, requestClientKey, sameOrigin } from "@/lib/rate-limit";

type MessageBody = {
  token?: string;
  body?: string;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const limited = rateLimit(`quote-message:${requestClientKey(request)}`, 30, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many messages." }, { status: 429 });
  }

  const { id } = await context.params;

  try {
    const payload = (await request.json()) as MessageBody;
    const token = payload.token?.trim() ?? "";
    const body = payload.body?.trim() ?? "";

    if (!token || !body) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const conversation = await getConversationForToken(id, token);
    if (!conversation) {
      return NextResponse.json({ error: "Quote not found." }, { status: 404 });
    }

    await sendCustomerMessage(conversation, body);
    const messages = await listMessages(id);
    return NextResponse.json({ ok: true, messages });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not send message." },
      { status: 500 },
    );
  }
}
