import { redirect } from "next/navigation";

/** Short entry URL for “Add to Home Screen” — opens the staff/customer quote inbox (pending tab). */
export default function QuotesInboxShortcutPage() {
  redirect("/account/quotes?tab=pending");
}
