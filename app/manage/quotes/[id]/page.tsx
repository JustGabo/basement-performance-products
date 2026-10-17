import { assertQuoteStaffWriter } from "@/lib/quotes/staff-access";
import { listMessages } from "@/lib/quotes/server";
import { hasShopifyAdminConfig } from "@/lib/shopify/admin";
import { AdminQuoteInbox } from "@/components/quotes/AdminQuoteInbox";
import type { AdminQuoteListItem } from "@/components/quotes/AdminQuoteListSidebar";
import type { QuoteMessage } from "@/lib/quotes/message-types";

export default async function ManageQuoteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const admin = await assertQuoteStaffWriter();

  const { data: quotesData } = await admin
    .from("quote_conversations")
    .select("id, product_name, customer_name, status")
    .order("created_at", { ascending: false })
    .limit(100);

  const quotes = (quotesData ?? []) as AdminQuoteListItem[];

  const { data: conversation, error } = await admin
    .from("quote_conversations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !conversation) {
    return (
      <main className="flex h-dvh items-center justify-center px-6">
        <p className="text-sm text-red-400">{error?.message ?? "Quote not found."}</p>
      </main>
    );
  }

  const messages = (await listMessages(id)) as QuoteMessage[];

  return (
    <AdminQuoteInbox
      quotes={quotes}
      activeConversation={conversation}
      messages={messages}
      hasShopifyAdmin={hasShopifyAdminConfig()}
      feedback={{
        error: typeof query.error === "string" ? query.error : undefined,
        saved: typeof query.saved === "string" ? query.saved : undefined,
      }}
    />
  );
}
