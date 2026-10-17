import { redirect } from "next/navigation";

/** Legacy alias — prefer `/quotes` or `/quotes/inbox`. */
export default function QuotesInboxShortcutPage() {
  redirect("/quotes?tab=pending");
}
