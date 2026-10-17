import Link from "next/link";
import { QuoteListShell } from "@/components/quotes/QuoteListShell";
import type { QuoteLocale } from "@/lib/quotes/copy";

export default async function AccountQuotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const locale: QuoteLocale = query.lang === "es" ? "es" : "en";

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black tracking-[.18em] text-brand uppercase">
          {locale === "es" ? "Envío internacional" : "International shipping"}
        </p>
        <h1 className="font-display text-[clamp(40px,5vw,68px)] leading-[.92] font-bold tracking-[-.035em] uppercase">
          {locale === "es" ? "Tus cotizaciones" : "Quote messages"}
        </h1>
        <p className="max-w-2xl text-sm text-foreground/55">
          {locale === "es"
            ? "Chats con el equipo sobre envío internacional. Las compras ya pagadas aparecen en Pedidos."
            : "Chats with our team about international shipping. Paid purchases appear under Orders."}
        </p>
      </div>

      <QuoteListShell locale={locale} basePath="/account/quotes" embedded />

      <p className="text-xs text-foreground/40">
        {locale === "es" ? "¿Nueva cotización? " : "Need a new quote? "}
        <Link className="text-brand underline underline-offset-4 hover:text-[#d99f00]" href="/shop">
          {locale === "es" ? "Explora productos" : "Browse products"}
        </Link>
      </p>
    </section>
  );
}
