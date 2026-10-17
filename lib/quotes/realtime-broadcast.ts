import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { QUOTE_REALTIME_EVENT, quoteRealtimeChannel } from "@/lib/quotes/realtime";

export async function broadcastQuoteUpdate(conversationId: string) {
  try {
    const supabase = createAdminClient();
    const channel = supabase.channel(quoteRealtimeChannel(conversationId));

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Realtime subscribe timeout")), 8_000);
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timeout);
          resolve();
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          clearTimeout(timeout);
          reject(new Error(`Realtime channel ${status}`));
        }
      });
    });

    const sendResult = await channel.send({
      type: "broadcast",
      event: QUOTE_REALTIME_EVENT,
      payload: { at: new Date().toISOString() },
    });

    if (sendResult !== "ok") {
      console.warn("[quotes] realtime broadcast send:", sendResult);
    }

    await supabase.removeChannel(channel);
  } catch (error) {
    console.warn("[quotes] realtime broadcast failed:", error);
  }
}
