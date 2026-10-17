import { requireAdmin } from "@/lib/admin/auth";
import { hasShopifyAdminConfig } from "@/lib/shopify/admin";
import { AdminQuoteInbox } from "@/components/quotes/AdminQuoteInbox";
import type { AdminQuoteListItem } from "@/components/quotes/AdminQuoteListSidebar";

export default async function ManageQuotesPage() {
  const { admin } = await requireAdmin();
  const { data, error } = await admin
    .from("quote_conversations")
    .select("id, product_name, customer_name, status")
    .order("created_at", { ascending: false })
    .limit(100);

  const quotes = (data ?? []) as AdminQuoteListItem[];

  if (error) {
    return (
      <main className="flex h-dvh items-center justify-center px-6">
        <p className="text-sm text-red-400">Could not load quotes: {error.message}</p>
      </main>
    );
  }

  return (
    <AdminQuoteInbox
      quotes={quotes}
      activeConversation={null}
      messages={[]}
      hasShopifyAdmin={hasShopifyAdminConfig()}
    />
  );
}
