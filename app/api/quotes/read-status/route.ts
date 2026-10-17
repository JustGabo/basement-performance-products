import { NextResponse } from "next/server";
import { getConversationForToken } from "@/lib/quotes/server";
import { hasCustomerUnread, type QuoteReadActivityRow } from "@/lib/quotes/read-state";
import { rateLimit, requestClientKey, sameOrigin } from "@/lib/rate-limit";

type SessionInput = { id?: string; token?: string };

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const limited = rateLimit(`quote-read-status:${requestClientKey(request)}`, 60, 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  try {
    const body = (await request.json()) as { sessions?: SessionInput[] };
    const sessions = body.sessions ?? [];
    const unread: Record<string, boolean> = {};

    await Promise.all(
      sessions.map(async (session) => {
        const id = session.id?.trim() ?? "";
        const token = session.token?.trim() ?? "";
        if (!id || !token) return;

        const conversation = await getConversationForToken(id, token);
        if (!conversation) return;

        unread[id] = hasCustomerUnread(conversation as QuoteReadActivityRow);
      }),
    );

    return NextResponse.json({ unread });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load read status." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
  const token = new URL(request.url).searchParams.get("token")?.trim() ?? "";
  if (!id || !token) {
    return NextResponse.json({ error: "Missing quote id or token." }, { status: 400 });
  }

  const conversation = await getConversationForToken(id, token);
  if (!conversation) {
    return NextResponse.json({ error: "Quote not found." }, { status: 404 });
  }

  return NextResponse.json({ unread: hasCustomerUnread(conversation) });
}
