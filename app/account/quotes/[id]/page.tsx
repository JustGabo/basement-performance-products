import Link from "next/link";
import { QuoteConversationShell } from "@/components/quotes/QuoteConversationShell";
import type { QuoteLocale } from "@/lib/quotes/copy";

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
