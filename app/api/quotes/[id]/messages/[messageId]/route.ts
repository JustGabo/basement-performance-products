import { NextResponse } from "next/server";
import {
  deleteOwnQuoteTextMessage,
  listMessages,
  updateOwnQuoteTextMessage,
} from "@/lib/quotes/server";
import { resolveQuoteMessageMutator } from "@/lib/quotes/message-mutation-auth";
import { rateLimit, requestClientKey, sameOrigin } from "@/lib/rate-limit";

type MessageMutationBody = {
  token?: string;
  body?: string;
};

function mutationErrorStatus(message: string) {
  if (message === "Message not found.") return 404;
  if (
    message === "You can only change your own messages." ||
    message === "This message cannot be changed."
  ) {
    return 403;
  }
  return 500;
}

async function parseMutationBody(request: Request) {
  try {
    return (await request.json()) as MessageMutationBody;
  } catch {
    return {};
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; messageId: string }> },
) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const limited = rateLimit(`quote-edit:${requestClientKey(request)}`, 60, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const { id: conversationId, messageId } = await context.params;

  try {
    const payload = await parseMutationBody(request);
    const token = payload.token?.trim() ?? "";
    const body = payload.body ?? "";
    const mutator = await resolveQuoteMessageMutator(conversationId, token);
    if (mutator instanceof NextResponse) return mutator;

    await updateOwnQuoteTextMessage({
      conversationId,
      messageId,
      asRole: mutator.asRole,
      body,
    });

    const messages = await listMessages(conversationId);
    return NextResponse.json({ ok: true, messages });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update message.";
    return NextResponse.json({ error: message }, { status: mutationErrorStatus(message) });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; messageId: string }> },
) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const limited = rateLimit(`quote-delete:${requestClientKey(request)}`, 40, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const { id: conversationId, messageId } = await context.params;

  try {
    const payload = await parseMutationBody(request);
    const token = payload.token?.trim() ?? "";
    const mutator = await resolveQuoteMessageMutator(conversationId, token);
    if (mutator instanceof NextResponse) return mutator;

    await deleteOwnQuoteTextMessage({
      conversationId,
      messageId,
      asRole: mutator.asRole,
    });

    const messages = await listMessages(conversationId);
    return NextResponse.json({ ok: true, messages });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete message.";
    return NextResponse.json({ error: message }, { status: mutationErrorStatus(message) });
  }
}
