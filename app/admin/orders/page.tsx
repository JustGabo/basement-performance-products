import Link from "next/link";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin/auth";
import { adminDate } from "@/lib/admin/format";
import { formatPrice } from "@/lib/commerce";

type OrderRow = { id: string; order_number: string; email: string; status: string; payment_status: string; total_cents: number; currency: string; created_at: string; order_items: Array<{ count: number }> };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const status = typeof params.status === "string" ? params.status : "all";
  const payment = typeof params.payment === "string" ? params.payment : "all";
  const page = Math.max(1, Number(typeof params.page === "string" ? params.page : 1) || 1);
  const pageSize = 15;
  const { admin } = await requireAdmin();
  let query = admin.from("orders").select("id, order_number, email, status, payment_status, total_cents, currency, created_at, order_items(count)", { count: "exact" });
  if (q) query = query.or(`order_number.ilike.%${q}%,email.ilike.%${q}%`);
  if (status !== "all") query = query.eq("status", status);
  if (payment !== "all") query = query.eq("payment_status", payment);
  const { data, count, error } = await query.order("created_at", { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  const orders = (data ?? []) as OrderRow[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / pageSize));
  const pageHref = (next: number) => `/admin/orders?${new URLSearchParams({ ...(q ? { q } : {}), ...(status !== "all" ? { status } : {}), ...(payment !== "all" ? { payment } : {}), page: String(next) })}`;

  return <section className="flex flex-col gap-7"><AdminPageHeader eyebrow="Fulfillment" title="Orders" description="Review payments, customer details and move each order through fulfillment." /><AdminFeedback error={typeof params.error === "string" ? params.error : undefined} saved={typeof params.saved === "string" ? params.saved : undefined} />
    <form className="grid grid-cols-[minmax(220px,1fr)_170px_170px_auto] gap-3 border border-foreground/12 bg-panel p-4 max-[850px]:grid-cols-2 max-[550px]:grid-cols-1"><label className="flex min-h-12 items-center gap-3 border border-foreground/15 bg-ink px-4"><Search className="text-foreground/35" size={17} /><input className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-foreground/30" defaultValue={q} name="q" placeholder="Order or customer email" /></label><select className="min-h-12 border border-foreground/15 bg-ink px-4 text-base outline-none" defaultValue={status} name="status"><option value="all">All order statuses</option>{["pending", "payment_pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"].map((value) => <option value={value} key={value}>{value.replaceAll("_", " ")}</option>)}</select><select className="min-h-12 border border-foreground/15 bg-ink px-4 text-base outline-none" defaultValue={payment} name="payment"><option value="all">All payments</option>{["pending", "authorized", "paid", "failed", "partially_refunded", "refunded"].map((value) => <option value={value} key={value}>{value.replaceAll("_", " ")}</option>)}</select><button className="min-h-12 cursor-pointer bg-foreground px-6 text-[9px] font-black text-ink uppercase" type="submit">Apply</button></form>
    {error ? <p className="border border-red-500/30 bg-red-500/8 p-5 text-sm text-red-400">Could not load orders: {error.message}</p> : orders.length ? <div className="overflow-x-auto border border-foreground/12 bg-panel"><table className="w-full min-w-[850px] border-collapse text-left"><thead><tr className="border-b border-foreground/12 text-[8px] font-black tracking-[.1em] text-foreground/40 uppercase"><th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Placed</th><th className="p-4">Status</th><th className="p-4">Payment</th><th className="p-4">Items</th><th className="p-4 text-right">Total</th></tr></thead><tbody>{orders.map((order) => <tr className="border-b border-foreground/8 transition last:border-b-0 hover:bg-foreground/3" key={order.id}><td className="p-4"><Link className="font-display text-lg font-bold uppercase hover:text-brand" href={`/admin/orders/${order.id}`}>{order.order_number}</Link></td><td className="p-4 text-xs text-foreground/55">{order.email}</td><td className="p-4 text-[10px] text-foreground/45">{adminDate(order.created_at)}</td><td className="p-4"><StatusBadge value={order.status} /></td><td className="p-4"><StatusBadge value={order.payment_status} /></td><td className="p-4 text-xs">{order.order_items?.[0]?.count ?? 0}</td><td className="p-4 text-right text-sm font-bold text-brand">{formatPrice(order.total_cents, "en-US", order.currency)}</td></tr>)}</tbody></table></div> : <div className="flex min-h-72 flex-col items-center justify-center gap-3 border border-dashed border-foreground/20 bg-panel px-6 text-center"><h2 className="font-display text-3xl font-bold uppercase">No matching orders</h2><p className="text-sm text-foreground/45">Orders will appear here after checkout.</p></div>}
    {pages > 1 && <nav className="flex items-center justify-center gap-4"><Link className={`grid size-11 place-items-center border border-foreground/15 ${page <= 1 ? "pointer-events-none opacity-30" : "hover:border-brand hover:text-brand"}`} href={pageHref(page - 1)}><ArrowLeft size={17} /></Link><span className="text-[10px] font-black uppercase">Page {page} of {pages}</span><Link className={`grid size-11 place-items-center border border-foreground/15 ${page >= pages ? "pointer-events-none opacity-30" : "hover:border-brand hover:text-brand"}`} href={pageHref(page + 1)}><ArrowRight size={17} /></Link></nav>}
  </section>;
}
