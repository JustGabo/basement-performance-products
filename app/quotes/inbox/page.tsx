import { redirect } from "next/navigation";

/** Alias: `/quotes/inbox` → quote list (same as `/quotes`). */
export default function QuotesInboxAliasPage() {
  redirect("/quotes?tab=pending");
}
