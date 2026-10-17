import Link from "next/link";
import { AdminQuoteInbox } from "@/components/quotes/AdminQuoteInbox";
import { QuoteConversationShell } from "@/components/quotes/QuoteConversationShell";
import type { AdminQuoteListItem } from "@/components/quotes/AdminQuoteListSidebar";
import { createAdminClient } from "@/lib/supabase/admin";
import { listMessages } from "@/lib/quotes/server";
import { isQuoteStaffEmail } from "@/lib/quotes/staff-access";
import { hasShopifyAdminConfig } from "@/lib/shopify/admin";
import { getShopifyCustomer } from "@/lib/shopify/customer-data";
import type { QuoteLocale } from "@/lib/quotes/copy";
import type { QuoteMessage } from "@/lib/quotes/message-types";

export default async function AccountQuoteConversationPage({
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
  const listHref = locale === "es" ? "/account/quotes?lang=es" : "/account/quotes";

  const customer = await getShopifyCustomer({ orders: 1, addresses: 1 });
  const email = customer?.emailAddress?.emailAddress ?? "";
  const staff = await isQuoteStaffEmail(email);

  if (staff) {
    const admin = createAdminClient();
    const [{ data: quotesData }, { data: conversation, error }] = await Promise.all([
      admin
        .from("quote_conversations")
        .select("id, product_name, customer_name, status")
        .order("created_at", { ascending: false })
        .limit(100),
      admin.from("quote_conversations").select("*").eq("id", id).maybeSingle(),
    ]);

    if (error || !conversation) {
      return (
        <section className="flex flex-col gap-4">
          <p className="text-sm text-red-400">{error?.message ?? "Quote not found."}</p>
          <Link className="text-brand underline underline-offset-4" href={listHref}>
            {locale === "es" ? "Volver a cotizaciones" : "Back to shipping quotes"}
          </Link>
        </section>
      );
    }

    const messages = (await listMessages(id)) as QuoteMessage[];
    const quotes = (quotesData ?? []) as AdminQuoteListItem[];
    const lang = conversation.locale === "es" ? "es" : "en";
    const fullscreenHref = `/manage/quotes/${conversation.id}`;

    return (
      <section className="flex flex-col gap-6">
        <AdminQuoteInbox
          quotes={quotes}
          activeConversation={conversation}
          messages={messages}
          hasShopifyAdmin={hasShopifyAdminConfig()}
          embedded
          listBasePath="/account/quotes"
          backHref={listHref}
          fullscreenHref={fullscreenHref}
          showShopLink={false}
          feedback={{
            error: typeof query.error === "string" ? query.error : undefined,
            saved: typeof query.saved === "string" ? query.saved : undefined,
          }}
        />
      </section>
    );
  }

  if (!token) {
    return (
      <section className="flex flex-col gap-4">
        <h1 className="font-display text-3xl font-bold uppercase">
          {locale === "es" ? "Enlace no válido" : "Invalid quote link"}
        </h1>
        <p className="text-sm text-foreground/55">
          {locale === "es"
            ? "Abre la cotización desde la lista o el correo que te enviamos."
            : "Open the quote from your list or the email we sent you."}
        </p>
        <Link className="text-brand underline underline-offset-4" href={listHref}>
          {locale === "es" ? "Volver a cotizaciones" : "Back to shipping quotes"}
        </Link>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 max-lg:hidden">
        <p className="text-[10px] font-black tracking-[.18em] text-brand uppercase">
          {locale === "es" ? "Envío internacional" : "International shipping"}
        </p>
        <h1 className="font-display text-4xl font-bold uppercase">
          {locale === "es" ? "Chat de cotización" : "Quote chat"}
        </h1>
      </div>
      <QuoteConversationShell
        conversationId={id}
        accessToken={token}
        fallbackLocale={locale}
        basePath="/account/quotes"
        embedded
      />
    </section>
  );
}
