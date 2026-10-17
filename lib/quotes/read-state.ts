export type QuoteReadActivityRow = {
  last_customer_message_at?: string | null;
  last_staff_side_message_at?: string | null;
  customer_last_read_at?: string | null;
  staff_last_read_at?: string | null;
};

function isAfter(latest?: string | null, readAt?: string | null) {
  if (!latest) return false;
  if (!readAt) return true;
  return new Date(latest).getTime() > new Date(readAt).getTime();
}

export function hasStaffUnread(row: QuoteReadActivityRow) {
  return isAfter(row.last_customer_message_at, row.staff_last_read_at);
}

export function hasCustomerUnread(row: QuoteReadActivityRow) {
  return isAfter(row.last_staff_side_message_at, row.customer_last_read_at);
}
