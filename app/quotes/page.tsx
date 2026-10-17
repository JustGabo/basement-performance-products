import { AdminQuoteInbox } from "@/components/quotes/AdminQuoteInbox";
import { QuoteListShell } from "@/components/quotes/QuoteListShell";
import type { AdminQuoteListItem } from "@/components/quotes/AdminQuoteListSidebar";
import { adminQuoteListSelect, mapAdminQuoteListRow } from "@/lib/quotes/admin-list";
import { createAdminClient } from "@/lib/supabase/admin";
import { isQuoteStaffEmail } from "@/lib/quotes/staff-access";
import { hasShopifyAdminConfig } from "@/lib/shopify/admin";
import { getShopifyCustomer } from "@/lib/shopify/customer-data";
import type { QuoteLocale } from "@/lib/quotes/copy";

export default async function QuotesIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const locale: QuoteLocale = query.lang === "es" ? "es" : "en";
  const customer = await getShopifyCustomer({ orders: 1, addresses: 1 });
  const email = customer?.emailAddress?.emailAddress ?? "";
  const staff = await isQuoteStaffEmail(email);

  if (staff) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("quote_conversations")
      .select(adminQuoteListSelect)
      .order("created_at", { ascending: false })
      .limit(100);
    const quotes = (data ?? []).map((row) => mapAdminQuoteListRow(row as AdminQuoteListItem));

    return (
      <AdminQuoteInbox
        quotes={quotes}
        activeConversation={null}
        messages={[]}
        hasShopifyAdmin={hasShopifyAdminConfig()}
        locale={locale}
        listBasePath="/quotes"
        backHref={locale === "es" ? "/quotes?lang=es" : "/quotes"}
        showShopLink
      />
    );
  }

  return <QuoteListShell locale={locale} />;
}
