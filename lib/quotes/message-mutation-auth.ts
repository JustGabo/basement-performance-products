import { NextResponse } from "next/server";
import { getConversationForToken } from "@/lib/quotes/server";
import { optionalQuoteStaffWriter } from "@/lib/quotes/staff-access";

export type QuoteMessageMutatorRole = "customer" | "staff";

export async function resolveQuoteMessageMutator(
  conversationId: string,
  token: string,
): Promise<{ asRole: QuoteMessageMutatorRole } | NextResponse> {
  if (token) {
    const conversation = await getConversationForToken(conversationId, token);
    if (!conversation) {
      return NextResponse.json({ error: "Quote not found." }, { status: 404 });
    }
    return { asRole: "customer" };
  }

  if (await optionalQuoteStaffWriter()) {
    return { asRole: "staff" };
  }

  return NextResponse.json({ error: "Not authorized to change this message." }, { status: 403 });
}
