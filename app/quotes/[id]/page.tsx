import Link from "next/link";
import { QuoteConversationShell } from "@/components/quotes/QuoteConversationShell";
import type { QuoteLocale } from "@/lib/quotes/copy";

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
