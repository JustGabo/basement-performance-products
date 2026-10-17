import Link from "next/link";
import { AdminQuoteInbox } from "@/components/quotes/AdminQuoteInbox";
import { QuoteListShell } from "@/components/quotes/QuoteListShell";
import type { AdminQuoteListItem } from "@/components/quotes/AdminQuoteListSidebar";
import { createAdminClient } from "@/lib/supabase/admin";
import { isQuoteStaffEmail } from "@/lib/quotes/staff-access";
import { hasShopifyAdminConfig } from "@/lib/shopify/admin";
import { getShopifyCustomer } from "@/lib/shopify/customer-data";
import type { QuoteLocale } from "@/lib/quotes/copy";

export default async function AccountQuotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const locale: QuoteLocale = query.lang === "es" ? "es" : "en";
  const customer = await getShopifyCustomer({ orders: 1, addresses: 1 });
  const email = customer?.emailAddress?.emailAddress ?? "";
  const staff = await isQuoteStaffEmail(email);

  let staffQuotes: AdminQuoteListItem[] = [];
  if (staff) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("quote_conversations")
      .select("id, product_name, customer_name, status")
      .order("created_at", { ascending: false })
      .limit(100);
    staffQuotes = (data ?? []) as AdminQuoteListItem[];
  }

  return (
    <section className="flex min-w-0 flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black tracking-[.18em] text-brand uppercase">
          {locale === "es" ? "Envío internacional" : "International shipping"}
        </p>
        <h1 className="font-display text-[clamp(40px,5vw,68px)] leading-[.92] font-bold tracking-[-.035em] uppercase">
          {staff
            ? locale === "es"
              ? "Bandeja de cotizaciones"
              : "Quote inbox"
            : locale === "es"
              ? "Tus cotizaciones"
              : "Quote messages"}
        </h1>
        <p className="max-w-2xl text-sm text-foreground/55">
          {staff
            ? locale === "es"
              ? "Todas las solicitudes de envío internacional. Responde, envía la cotización y el link de Shopify."
              : "All international shipping requests. Reply, send quotes, and share Shopify checkout links."
            : locale === "es"
              ? "Chats con el equipo sobre envío internacional. Las compras ya pagadas aparecen en Pedidos."
              : "Chats with our team about international shipping. Paid purchases appear under Orders."}
        </p>
      </div>

      {staff ? (
        <AdminQuoteInbox
          quotes={staffQuotes}
          activeConversation={null}
          messages={[]}
          hasShopifyAdmin={hasShopifyAdminConfig()}
          embedded
          listBasePath="/account/quotes"
          backHref={locale === "es" ? "/account/quotes?lang=es" : "/account/quotes"}
          showShopLink={false}
        />
      ) : (
        <QuoteListShell locale={locale} basePath="/account/quotes" embedded />
      )}

      <p className="text-xs text-foreground/40">
        {locale === "es" ? "¿Nueva cotización? " : "Need a new quote? "}
        <Link className="text-brand underline underline-offset-4 hover:text-[#d99f00]" href="/shop">
          {locale === "es" ? "Explora productos" : "Browse products"}
        </Link>
        {staff ? (
          <>
            {" · "}
            <Link className="text-brand underline underline-offset-4 hover:text-[#d99f00]" href="/manage/quotes">
              {locale === "es" ? "Vista clásica /manage" : "Classic /manage view"}
            </Link>
          </>
        ) : null}
      </p>
    </section>
  );
}
