import Link from "next/link";
import { AdminQuoteInbox } from "@/components/quotes/AdminQuoteInbox";
import { QuoteConversationShell } from "@/components/quotes/QuoteConversationShell";
import type { AdminQuoteListItem } from "@/components/quotes/AdminQuoteListSidebar";
import { adminQuoteListSelect, mapAdminQuoteListRow } from "@/lib/quotes/admin-list";
import { createAdminClient } from "@/lib/supabase/admin";
import { listMessages } from "@/lib/quotes/server";
import { isQuoteStaffEmail } from "@/lib/quotes/staff-access";
import { hasShopifyAdminConfig } from "@/lib/shopify/admin";
import { getShopifyCustomer } from "@/lib/shopify/customer-data";
import type { QuoteLocale } from "@/lib/quotes/copy";
import type { QuoteMessage } from "@/lib/quotes/message-types";

export default async function QuoteConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : "";
  const locale: QuoteLocale = query.lang === "es" ? "es" : "en";
  const listHref = locale === "es" ? "/quotes?lang=es" : "/quotes";

  const customer = await getShopifyCustomer({ orders: 1, addresses: 1 });
  const email = customer?.emailAddress?.emailAddress ?? "";
  const staff = await isQuoteStaffEmail(email);

  if (staff) {
    const admin = createAdminClient();
    const [{ data: quotesData }, { data: conversation, error }] = await Promise.all([
      admin
        .from("quote_conversations")
        .select(adminQuoteListSelect)
        .order("created_at", { ascending: false })
        .limit(100),
      admin.from("quote_conversations").select("*").eq("id", id).maybeSingle(),
    ]);

    if (error || !conversation) {
      return (
        <main className="mx-auto flex min-h-dvh w-[min(720px,calc(100%-32px))] flex-col justify-center gap-4 py-16">
          <p className="text-sm text-red-400">{error?.message ?? "Quote not found."}</p>
          <Link className="text-brand underline underline-offset-4" href={listHref}>
            {locale === "es" ? "Volver a cotizaciones" : "Back to quotes"}
          </Link>
        </main>
      );
    }

    const messages = (await listMessages(id)) as QuoteMessage[];
    const quotes = (quotesData ?? []).map((row) => mapAdminQuoteListRow(row as AdminQuoteListItem));

    return (
      <AdminQuoteInbox
        quotes={quotes}
        activeConversation={conversation}
        messages={messages}
        hasShopifyAdmin={hasShopifyAdminConfig()}
        locale={locale}
        listBasePath="/quotes"
        backHref={listHref}
        showShopLink
        feedback={{
          error: typeof query.error === "string" ? query.error : undefined,
          saved: typeof query.saved === "string" ? query.saved : undefined,
        }}
      />
    );
  }

  if (!token) {
    return (
      <main className="mx-auto flex min-h-dvh w-[min(720px,calc(100%-32px))] flex-col justify-center gap-4 py-16">
        <h1 className="font-display text-3xl font-bold uppercase">Quote link invalid</h1>
        <p className="text-sm text-foreground/55">Open the link from your email or start a new quote from the product page.</p>
        <Link className="text-brand underline underline-offset-4" href="/shop">
          Back to shop
        </Link>
      </main>
    );
  }

  return <QuoteConversationShell conversationId={id} accessToken={token} fallbackLocale={locale} />;
}
