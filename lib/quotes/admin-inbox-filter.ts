import type { AdminQuoteListItem } from "@/components/quotes/AdminQuoteListSidebar";

export type AdminInboxTab = "pending" | "all" | "resolved";

export function parseAdminInboxTab(value: string | string[] | undefined): AdminInboxTab {
  const raw = typeof value === "string" ? value : "pending";
  if (raw === "all" || raw === "resolved") return raw;
  return "pending";
}

export function filterAdminQuotes(quotes: AdminQuoteListItem[], tab: AdminInboxTab) {
  if (tab === "all") return quotes;
  if (tab === "resolved") {
    return quotes.filter((quote) => quote.status === "quoted" || quote.status === "closed");
  }
  return quotes.filter((quote) => quote.status === "collecting" || quote.status === "reviewing");
}
