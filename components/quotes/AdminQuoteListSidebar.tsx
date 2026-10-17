"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "cn";

export type AdminQuoteListItem = {
  id: string;
  product_name: string;
  customer_name: string;
  status: string;
};

function statusLabel(status: string) {
  switch (status) {
    case "quoted":
      return "Ready";
    case "reviewing":
      return "Reviewing";
    case "collecting":
      return "Pending";
    default:
      return status;
  }
}

export function AdminQuoteListSidebar({
  quotes,
  activeId,
  showShopLink = false,
  className,
}: {
  quotes: AdminQuoteListItem[];
  activeId: string | null;
  showShopLink?: boolean;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "flex min-h-0 w-full shrink-0 flex-col border-foreground/10 bg-panel/40 lg:h-full lg:w-[360px] lg:border-r",
        className,
      )}
    >
      <div className="border-b border-foreground/10 px-4 py-3">
        {showShopLink ? (
          <Link
            className="mb-3 inline-flex items-center gap-2 text-[10px] font-black tracking-[.06em] text-foreground/55 uppercase hover:text-brand"
            href="/shop"
          >
            <ArrowLeft size={14} />
            Back to shop
          </Link>
        ) : null}
        <p className="text-[10px] font-black tracking-[.14em] text-brand uppercase">Shipping quotes</p>
        <p className="mt-1 text-xs text-foreground/45">International quote inbox</p>
      </div>
      <nav className="quote-sidebar-scroll flex min-h-0 flex-1 flex-col overflow-y-auto">
        {quotes.length === 0 ? (
          <p className="px-4 py-6 text-xs leading-5 text-foreground/45">No quote requests yet.</p>
        ) : (
          quotes.map((quote) => {
            const active = activeId === quote.id;
            return (
              <Link
                key={quote.id}
                className={`flex flex-col gap-0.5 border-b border-foreground/8 px-4 py-3.5 transition ${
                  active
                    ? "border-l-[3px] border-l-brand bg-brand/10"
                    : "border-l-[3px] border-l-transparent hover:bg-panel/60"
                }`}
                href={`/manage/quotes/${quote.id}`}
              >
                <span className="line-clamp-2 text-[11px] font-bold leading-4 uppercase">{quote.product_name}</span>
                <span className="truncate text-[10px] text-foreground/45">{quote.customer_name}</span>
                <span className="text-[10px] text-foreground/40">{statusLabel(quote.status)}</span>
              </Link>
            );
          })
        )}
      </nav>
    </aside>
  );
}
