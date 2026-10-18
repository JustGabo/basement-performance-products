import type { QuoteMessage } from "@/lib/quotes/message-types";

export const PENDING_MESSAGE_ID_PREFIX = "pending:";

export function isPendingQuoteMessage(message: QuoteMessage) {
  return message.id.startsWith(PENDING_MESSAGE_ID_PREFIX);
}

export function buildOptimisticCustomerMessage(body: string, clientMessageId: string): QuoteMessage {
  return {
    id: `${PENDING_MESSAGE_ID_PREFIX}${clientMessageId}`,
    role: "customer",
    message_type: "text",
    body,
    payload: { pending: true, clientMessageId },
    created_at: new Date().toISOString(),
  };
}

/** Append in-flight optimistic bubbles after server messages (drop once confirmed). */
export function mergeQuoteMessagesWithOutbox(server: QuoteMessage[], outbox: QuoteMessage[]) {
  if (outbox.length === 0) return server;

  const confirmedClientIds = new Set<string>();
  for (const message of server) {
    if (message.role !== "customer") continue;
    const clientMessageId = message.payload?.clientMessageId;
    if (typeof clientMessageId === "string") {
      confirmedClientIds.add(clientMessageId);
    }
  }

  const pending = outbox.filter((message) => {
    const clientMessageId = message.payload?.clientMessageId;
    if (typeof clientMessageId !== "string") return false;
    return !confirmedClientIds.has(clientMessageId);
  });

  if (pending.length === 0) return server;
  return [...server, ...pending];
}
