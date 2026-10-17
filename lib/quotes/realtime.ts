export const QUOTE_REALTIME_EVENT = "quote_update";

export function quoteRealtimeChannel(conversationId: string) {
  return `quote:${conversationId}`;
}
