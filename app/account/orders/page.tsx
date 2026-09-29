import Link from "next/link";
import { ExternalLink, PackageOpen } from "lucide-react";
import { customerMoney, getShopifyCustomer } from "@/lib/shopify/customer-data";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const customer = await getShopifyCustomer({ orders: 50, addresses: 1 });
  const orders = customer?.orders.nodes ?? [];
  return <section className="flex flex-col gap-8">
    <div className="flex flex-col gap-2"><p className="text-[10px] font-black tracking-[.18em] text-brand uppercase">Shopify order history</p><h1 className="font-display text-[clamp(48px,6vw,78px)] leading-[.9] font-bold tracking-[-.035em] uppercase">Your orders</h1><p className="text-sm text-foreground/55">Review purchases, payments and delivery progress from your Shopify account.</p></div>
    {orders.length === 0 ? <div className="flex min-h-80 flex-col items-center justify-center gap-5 border border-dashed border-foreground/20 bg-panel px-6 text-center"><PackageOpen className="text-brand" size={38} /><div className="flex flex-col gap-2"><h2 className="font-display text-3xl font-bold uppercase">No orders yet</h2><p className="text-sm text-foreground/50">Your completed Shopify purchases will appear here.</p></div><Link className="bg-brand px-6 py-4 text-[10px] font-black text-black uppercase" href="/#products">Browse products</Link></div> : <div className="flex flex-col gap-4">{orders.map((order) => <article className="flex flex-col gap-5 border border-foreground/15 bg-panel p-5" key={order.id}>
      <div className="flex items-start justify-between gap-5 max-[600px]:flex-col"><div className="flex flex-col gap-1"><span className="text-[9px] font-black tracking-[.12em] text-brand uppercase">Order</span><h2 className="font-display text-2xl font-bold uppercase">{order.name}</h2><time className="text-[10px] text-foreground/45" dateTime={order.processedAt}>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(order.processedAt))}</time></div><div className="flex items-center gap-3"><span className="border border-foreground/20 px-3 py-2 text-[9px] font-bold uppercase">{order.fulfillmentStatus.replaceAll("_", " ")}</span><strong className="text-lg text-brand">{customerMoney(order.totalPrice)}</strong></div></div>
      <div className="flex flex-col gap-2 border-t border-foreground/12 pt-4">{order.lineItems.nodes.map((item) => <div className="flex justify-between gap-5 text-xs text-foreground/60" key={item.id}><span>{item.quantity} × {item.name}</span><span>{item.totalPrice ? customerMoney(item.totalPrice) : "—"}</span></div>)}</div><a className="flex min-h-11 w-fit items-center gap-3 border border-brand px-5 text-[9px] font-black text-brand uppercase transition hover:bg-brand hover:text-black" href={order.statusPageUrl}>View Shopify order<ExternalLink size={15} /></a>
    </article>)}</div>}
  </section>;
}
