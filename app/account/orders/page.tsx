import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/commerce";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type OrderItem = { id: string; product_name: string; quantity: number; line_total_cents: number };
type Order = { id: string; order_number: string; status: string; payment_status: string; total_cents: number; currency: string; created_at: string; order_items: OrderItem[] };

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || !userId) redirect("/sign-in");

  const { data, error } = await supabase.from("orders").select("id, order_number, status, payment_status, total_cents, currency, created_at, order_items(id, product_name, quantity, line_total_cents)").eq("user_id", userId).order("created_at", { ascending: false });
  const orders = (data ?? []) as Order[];

  return <section className="flex flex-col gap-8">
    <div className="flex flex-col gap-2"><p className="text-[10px] font-black tracking-[.18em] text-brand uppercase">Order history</p><h1 className="font-display text-[clamp(48px,6vw,78px)] leading-[.9] font-bold tracking-[-.035em] uppercase">Your orders</h1><p className="text-sm text-foreground/55">Review your purchases and follow their current status.</p></div>
    {error ? <p className="border-l-2 border-red-500 bg-red-500/10 p-4 text-sm text-red-500">We could not load your orders. Please try again.</p> : orders.length === 0 ? <div className="flex min-h-80 flex-col items-center justify-center gap-5 border border-dashed border-foreground/20 bg-panel px-6 text-center"><PackageOpen className="text-brand" size={38} /><div className="flex flex-col gap-2"><h2 className="font-display text-3xl font-bold uppercase">No orders yet</h2><p className="text-sm text-foreground/50">Your completed purchases will appear here.</p></div><Link className="bg-brand px-6 py-4 text-[10px] font-black text-black uppercase" href="/#products">Browse products</Link></div> : <div className="flex flex-col gap-4">{orders.map((order) => <article className="flex flex-col gap-5 border border-foreground/15 bg-panel p-5" key={order.id}>
      <div className="flex items-start justify-between gap-5 max-[600px]:flex-col"><div className="flex flex-col gap-1"><span className="text-[9px] font-black tracking-[.12em] text-brand uppercase">Order</span><h2 className="font-display text-2xl font-bold uppercase">{order.order_number}</h2><time className="text-[10px] text-foreground/45" dateTime={order.created_at}>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(order.created_at))}</time></div><div className="flex items-center gap-3"><span className="border border-foreground/20 px-3 py-2 text-[9px] font-bold uppercase">{order.status.replaceAll("_", " ")}</span><strong className="text-lg text-brand">{formatPrice(order.total_cents, "en-US", order.currency)}</strong></div></div>
      <div className="flex flex-col gap-2 border-t border-foreground/12 pt-4">{order.order_items.map((item) => <div className="flex justify-between gap-5 text-xs text-foreground/60" key={item.id}><span>{item.quantity} × {item.product_name}</span><span>{formatPrice(item.line_total_cents, "en-US", order.currency)}</span></div>)}</div><Link className="flex min-h-11 w-fit items-center border border-brand px-5 text-[9px] font-black text-brand uppercase transition hover:bg-brand hover:text-black" href={`/account/orders/${order.id}`}>View order details</Link>
    </article>)}</div>}
  </section>;
}
