import "server-only";

import type { WebSocketLikeConstructor } from "@supabase/realtime-js";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { WebSocket } from "ws";

const serverWebSocket = WebSocket as unknown as WebSocketLikeConstructor;

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY.");
  }

  return createSupabaseClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: serverWebSocket },
  });
}
