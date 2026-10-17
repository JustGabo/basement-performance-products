import type { AdminQuoteListItem } from "@/components/quotes/AdminQuoteListSidebar";
import { hasStaffUnread, type QuoteReadActivityRow } from "@/lib/quotes/read-state";

export const adminQuoteListSelect =
  "id, product_name, customer_name, status, last_customer_message_at, staff_last_read_at";

export function mapAdminQuoteListRow(row: QuoteReadActivityRow & AdminQuoteListItem): AdminQuoteListItem {
  return {
    id: row.id,
    product_name: row.product_name,
    customer_name: row.customer_name,
    status: row.status,
    unread: hasStaffUnread(row),
  };
}
