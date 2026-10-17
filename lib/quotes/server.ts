import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { quoteCopy, type QuoteLocale } from "@/lib/quotes/copy";
import { broadcastQuoteUpdate } from "@/lib/quotes/realtime-broadcast";

export type QuoteConversationStatus = "collecting" | "reviewing" | "quoted" | "closed";

export type QuoteMessageRow = {
  id: string;
  conversation_id: string;
  role: "bot" | "customer" | "staff";
  message_type: "text" | "offer" | "system";
  body: string;
  payload: Record<string, unknown> | null;
  created_at: string;
};

export type QuoteConversationRow = {
  id: string;
  access_token: string;
  product_slug: string;
  product_name: string;
  product_part: string | null;
  merchandise_id: string | null;
  variant_sku: string | null;
  unit_price_cents: number | null;
  currency: string;
  customer_email: string;
  customer_name: string;
  locale: string;
  status: QuoteConversationStatus;
  country: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  quantity: number;
  phone: string | null;
  notes: string | null;
  shopify_draft_order_id: string | null;
  invoice_url: string | null;
  offer_shipping_cents: number | null;
  offer_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

function admin() {
  return createAdminClient();
}

export async function getConversationForToken(id: string, token: string) {
  const { data, error } = await admin()
    .from("quote_conversations")
    .select("*")
    .eq("id", id)
    .eq("access_token", token)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as QuoteConversationRow | null;
}

export async function listMessages(conversationId: string) {
  const { data, error } = await admin()
    .from("quote_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as QuoteMessageRow[];
}

export async function insertMessage(input: {
  conversationId: string;
  role: QuoteMessageRow["role"];
  messageType?: QuoteMessageRow["message_type"];
  body: string;
  payload?: Record<string, unknown>;
}) {
  const { data, error } = await admin()
    .from("quote_messages")
    .insert({
      conversation_id: input.conversationId,
      role: input.role,
      message_type: input.messageType ?? "text",
      body: input.body,
      payload: input.payload ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  void broadcastQuoteUpdate(input.conversationId);
  return data as QuoteMessageRow;
}

export async function createConversation(
  input: {
    productSlug: string;
    productName: string;
    productPart?: string;
    merchandiseId?: string;
    variantSku?: string;
    unitPriceCents?: number;
    currency?: string;
    customerEmail: string;
    customerName: string;
    locale: QuoteLocale;
  },
  options?: { welcome: "form" | "none" },
) {
  const locale = input.locale;
  const t = quoteCopy[locale];
  const welcome = options?.welcome ?? "form";

  const { data, error } = await admin()
    .from("quote_conversations")
    .insert({
      product_slug: input.productSlug,
      product_name: input.productName,
      product_part: input.productPart ?? null,
      merchandise_id: input.merchandiseId ?? null,
      variant_sku: input.variantSku ?? null,
      unit_price_cents: input.unitPriceCents ?? null,
      currency: input.currency ?? "USD",
      customer_email: input.customerEmail.trim().toLowerCase(),
      customer_name: input.customerName.trim(),
      locale,
      status: "collecting",
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  const conversation = data as QuoteConversationRow;
  if (welcome === "form") {
    await insertMessage({
      conversationId: conversation.id,
      role: "bot",
      body: t.botWelcome(input.productName),
    });
  }
  return conversation;
}

export type QuoteIntakeInput = {
  country: string;
  city: string;
  region?: string;
  postalCode: string;
  quantity: number;
  phone?: string;
  notes?: string;
};

export async function createConversationWithIntake(
  conversationInput: Parameters<typeof createConversation>[0],
  intakeInput: QuoteIntakeInput,
) {
  const locale = conversationInput.locale;
  const t = quoteCopy[locale];
  const conversation = await createConversation(conversationInput, { welcome: "none" });
  await insertMessage({
    conversationId: conversation.id,
    role: "bot",
    body: t.botChatOpened(conversationInput.productName, conversationInput.customerName.trim()),
  });
  return submitIntake(conversation, intakeInput);
}

export function intakeSummary(conversation: QuoteConversationRow) {
  return [
    `Country: ${conversation.country}`,
    `City: ${conversation.city}`,
    `Postal code: ${conversation.postal_code}`,
    `Quantity: ${conversation.quantity}`,
    `Name: ${conversation.customer_name}`,
    conversation.phone ? `Phone: ${conversation.phone}` : null,
    conversation.notes ? `Notes: ${conversation.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function submitIntake(
  conversation: QuoteConversationRow,
  input: {
    country: string;
    city: string;
    region?: string;
    postalCode: string;
    quantity: number;
    phone?: string;
    notes?: string;
  },
) {
  const locale = (conversation.locale === "es" ? "es" : "en") as QuoteLocale;
  const t = quoteCopy[locale];

  const { data, error } = await admin()
    .from("quote_conversations")
    .update({
      country: input.country.trim(),
      city: input.city.trim(),
      region: input.region?.trim() || null,
      postal_code: input.postalCode.trim(),
      quantity: input.quantity,
      phone: input.phone?.trim() || null,
      notes: input.notes?.trim() || null,
      status: "reviewing",
    })
    .eq("id", conversation.id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  const updated = data as QuoteConversationRow;
  await insertMessage({
    conversationId: updated.id,
    role: "customer",
    messageType: "system",
    body: intakeSummary(updated),
    payload: {
      kind: "intake",
      country: updated.country,
      city: updated.city,
      region: updated.region,
      postalCode: updated.postal_code,
      quantity: updated.quantity,
      name: updated.customer_name,
      phone: updated.phone,
      notes: updated.notes,
    },
  });
  await insertMessage({
    conversationId: updated.id,
    role: "bot",
    body: t.botAfterIntake,
  });
  return updated;
}

export async function sendCustomerMessage(conversation: QuoteConversationRow, body: string) {
  if (conversation.status === "closed") {
    throw new Error("This quote chat is closed.");
  }

  const trimmed = body.trim();
  if (!trimmed) {
    throw new Error("Message is required.");
  }
  if (trimmed.length > 2000) {
    throw new Error("Message is too long.");
  }

  await insertMessage({
    conversationId: conversation.id,
    role: "customer",
    messageType: "text",
    body: trimmed,
  });
}
