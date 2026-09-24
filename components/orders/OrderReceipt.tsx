import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, PackageCheck, ReceiptText, Truck } from "lucide-react";
import type { CustomerOrderDetail } from "@/lib/orders/server";
import { formatPrice } from "@/lib/commerce";

const statusCopy: Record<string, string> = {
  pending: "Pending", payment_pending: "Awaiting payment", paid: "Paid", processing: "Processing",
  shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled", refunded: "Refunded",
};

function addressLine(address: Record<string, unknown>) {
  return [address.line_1, address.line_2, address.city, address.state_region, address.postal_code, address.country_code]
    .filter((value): value is string => typeof value === "string" && Boolean(value))
    .join(", ");
}

export function OrderReceipt({ order, confirmation = false }: { order: CustomerOrderDetail; confirmation?: boolean }) {
  const date = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short" }).format(new Date(order.placed_at ?? order.created_at));

  return <div className="flex flex-col gap-8">
    {confirmation && <section className="flex flex-col items-center gap-5 border border-brand/35 bg-brand/6 px-6 py-10 text-center"><span className="grid size-16 place-items-center rounded-full border border-brand/50 text-brand"><CheckCircle2 size={31} /></span><div className="flex flex-col gap-2"><p className="text-[10px] font-black tracking-[.18em] text-brand uppercase">Payment confirmed</p><h1 className="font-display text-[clamp(46px,7vw,82px)] leading-[.9] font-bold uppercase">Your order is in.</h1><p className="text-sm text-foreground/55">A receipt has been created for {order.email}.</p></div></section>}

    <section className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6 max-[900px]:grid-cols-1">
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-5 border border-foreground/15 bg-panel p-5 max-[600px]:flex-col"><div className="flex flex-col gap-1"><span className="text-[9px] font-black tracking-[.12em] text-brand uppercase">Order number</span><h2 className="font-display text-3xl font-bold uppercase">{order.order_number}</h2><time className="text-[10px] text-foreground/45">{date}</time></div><div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/8 px-3 py-2 text-[9px] font-black text-emerald-500 uppercase"><CheckCircle2 size={14} />{statusCopy[order.status] ?? order.status}</div></div>

        <div className="flex flex-col border border-foreground/15 bg-panel">{order.order_items.map((item) => <article className="grid grid-cols-[92px_minmax(0,1fr)_auto] items-center gap-4 border-b border-foreground/10 p-4 last:border-b-0 max-[550px]:grid-cols-[72px_minmax(0,1fr)]" key={item.id}><div className="relative h-22 overflow-hidden bg-ink max-[550px]:h-18">{item.image_url ? <Image className="object-cover" src={item.image_url} alt={item.product_name} fill sizes="92px" /> : <span className="absolute inset-0 grid place-items-center text-brand"><PackageCheck size={22} /></span>}</div><div className="min-w-0"><h3 className="font-display truncate text-xl font-bold uppercase max-[550px]:text-base">{item.product_name}</h3><p className="truncate text-[9px] text-foreground/45 uppercase">{item.product_description ?? "Performance product"}</p><p className="text-[10px] text-foreground/55">{item.quantity} × {formatPrice(item.unit_price_cents, "en-US", order.currency)}</p></div><strong className="text-sm text-brand max-[550px]:col-span-2 max-[550px]:justify-self-end">{formatPrice(item.line_total_cents, "en-US", order.currency)}</strong></article>)}</div>

        <div className="grid grid-cols-2 gap-4 max-[650px]:grid-cols-1"><div className="flex min-h-40 flex-col gap-4 border border-foreground/15 bg-panel p-5"><MapPin className="text-brand" size={21} /><div className="flex flex-col gap-1"><h3 className="font-display text-xl font-bold uppercase">Shipping address</h3><strong className="text-xs">{String(order.shipping_address.recipient_name ?? "Customer")}</strong><p className="text-xs leading-5 text-foreground/50">{addressLine(order.shipping_address)}</p></div></div><div className="flex min-h-40 flex-col gap-4 border border-foreground/15 bg-panel p-5"><Truck className="text-brand" size={21} /><div className="flex flex-col gap-1"><h3 className="font-display text-xl font-bold uppercase">Delivery</h3><p className="text-xs leading-5 text-foreground/50">We will contact you when the order enters processing and provide delivery details when it ships.</p></div></div></div>
      </div>

      <aside className="sticky top-24 flex flex-col gap-5 border border-foreground/15 bg-panel p-6 max-[900px]:static"><div className="flex items-center gap-3"><ReceiptText className="text-brand" size={21} /><h2 className="font-display text-2xl font-bold uppercase">Payment summary</h2></div><div className="flex flex-col gap-3 text-xs"><div className="flex justify-between gap-5 text-foreground/55"><span>Subtotal</span><strong className="text-foreground">{formatPrice(order.subtotal_cents, "en-US", order.currency)}</strong></div><div className="flex justify-between gap-5 text-foreground/55"><span>Shipping</span><strong className="text-foreground">{formatPrice(order.shipping_cents, "en-US", order.currency)}</strong></div><div className="flex justify-between gap-5 text-foreground/55"><span>Taxes</span><strong className="text-foreground">{formatPrice(order.tax_cents, "en-US", order.currency)}</strong></div>{order.discount_cents > 0 && <div className="flex justify-between gap-5 text-emerald-500"><span>Discount</span><strong>-{formatPrice(order.discount_cents, "en-US", order.currency)}</strong></div>}<div className="flex items-end justify-between gap-5 border-t border-foreground/12 pt-4"><strong className="font-display text-2xl uppercase">Total</strong><strong className="text-2xl text-brand">{formatPrice(order.total_cents, "en-US", order.currency)}</strong></div></div><div className="flex items-center justify-between gap-4 border-t border-foreground/12 pt-4 text-[9px] font-black uppercase"><span className="text-foreground/45">Payment</span><span className="text-emerald-500">{order.payment_status}</span></div></aside>
    </section>

    {confirmation && <div className="flex flex-wrap justify-center gap-3"><Link className="flex min-h-12 items-center gap-4 bg-brand px-6 text-[10px] font-black text-black uppercase" href={`/account/orders/${order.id}`}>View order details<ArrowRight size={17} /></Link><Link className="flex min-h-12 items-center border border-brand px-6 text-[10px] font-black text-brand uppercase" href="/#products">Continue shopping</Link></div>}
  </div>;
}
