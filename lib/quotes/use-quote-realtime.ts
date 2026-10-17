"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { QUOTE_REALTIME_EVENT, quoteRealtimeChannel } from "@/lib/quotes/realtime";

export function useQuoteRealtime(conversationId: string | null, onUpdate: () => void) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!conversationId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(quoteRealtimeChannel(conversationId))
      .on("broadcast", { event: QUOTE_REALTIME_EVENT }, () => {
        onUpdateRef.current();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId]);
}
