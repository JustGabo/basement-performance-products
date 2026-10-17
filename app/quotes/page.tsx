import { QuoteListShell } from "@/components/quotes/QuoteListShell";
import type { QuoteLocale } from "@/lib/quotes/copy";

export default async function QuotesIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const locale: QuoteLocale = query.lang === "es" ? "es" : "en";

  return <QuoteListShell locale={locale} />;
}
