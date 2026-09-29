import Link from "next/link";
import { ArrowRight, MapPin, Package, ShieldCheck } from "lucide-react";
import { customerMoney, getShopifyCustomer } from "@/lib/shopify/customer-data";

const cards = [
  { href: "/account/orders", label: "Orders", copy: "Review purchases and delivery progress.", icon: Package },
  { href: "/account/addresses", label: "Addresses", copy: "Manage shipping and billing destinations.", icon: MapPin },
  { href: "/account/profile", label: "Profile & security", copy: "Update your details, preferences and password.", icon: ShieldCheck },
];

export default async function AccountPage() {
  const customer = await getShopifyCustomer({ orders: 20, addresses: 20 });
  const recentOrders = customer?.orders.nodes.slice(0, 3) ?? [];

  return <section className="flex flex-col gap-8">
    <div className="flex flex-col gap-2"><p className="text-[10px] font-black tracking-[.18em] text-brand uppercase">Member dashboard</p><h1 className="font-display text-[clamp(48px,6vw,78px)] leading-[.9] font-bold tracking-[-.035em] uppercase">Your account</h1><p className="max-w-2xl text-sm leading-6 text-foreground/55">Manage the essentials of your Basement account from one place.</p></div>

    <div className="grid grid-cols-2 gap-3 max-[600px]:grid-cols-1"><div className="flex flex-col gap-1 border border-foreground/12 bg-panel p-4"><strong className="font-display text-3xl">{customer?.orders.nodes.length ?? 0}</strong><span className="text-[9px] font-black tracking-[.08em] text-foreground/45 uppercase">Recent orders</span></div><div className="flex flex-col gap-1 border border-foreground/12 bg-panel p-4"><strong className="font-display text-3xl">{customer?.addresses.nodes.length ?? 0}</strong><span className="text-[9px] font-black tracking-[.08em] text-foreground/45 uppercase">Addresses</span></div></div>

    <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">{cards.map(({ href, label, copy, icon: Icon }) => <Link className="group flex min-h-44 flex-col justify-between gap-6 border border-foreground/12 bg-panel p-5 transition hover:-translate-y-0.5 hover:border-brand" href={href} key={href}><span className="grid size-11 place-items-center border border-brand/40 text-brand"><Icon size={21} /></span><div className="flex items-end justify-between gap-5"><div className="flex flex-col gap-1"><h2 className="font-display text-2xl font-bold uppercase">{label}</h2><p className="text-xs leading-5 text-foreground/50">{copy}</p></div><ArrowRight className="shrink-0 text-brand transition group-hover:translate-x-1" size={18} /></div></Link>)}</div>

    <div className="flex flex-col gap-4"><div className="flex items-center justify-between gap-5"><h2 className="font-display text-3xl font-bold uppercase">Recent orders</h2><Link className="text-[9px] font-black text-brand uppercase" href="/account/orders">View all</Link></div>{recentOrders.length ? <div className="flex flex-col border border-foreground/12 bg-panel">{recentOrders.map((order) => <a className="grid grid-cols-[1fr_auto_auto] items-center gap-5 border-b border-foreground/10 p-4 last:border-b-0 max-[600px]:grid-cols-[1fr_auto]" href={order.statusPageUrl} key={order.id}><div><p className="font-display text-lg font-bold uppercase">{order.name}</p><p className="text-[9px] text-foreground/45">{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(order.processedAt))}</p></div><span className="text-[9px] font-bold text-foreground/55 uppercase max-[600px]:hidden">{order.fulfillmentStatus.replaceAll("_", " ")}</span><strong className="text-sm text-brand">{customerMoney(order.totalPrice)}</strong></a>)}</div> : <p className="border border-dashed border-foreground/20 p-6 text-sm text-foreground/50">Your latest Shopify purchases will appear here.</p>}</div>
  </section>;
}
