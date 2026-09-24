import Link from "next/link";
import { ArrowRight, Heart, MapPin, Package, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/commerce";
import { createClient } from "@/lib/supabase/server";

const cards = [
  { href: "/account/orders", label: "Orders", copy: "Review purchases and delivery progress.", icon: Package },
  { href: "/account/addresses", label: "Addresses", copy: "Manage shipping and billing destinations.", icon: MapPin },
  { href: "/account/favorites", label: "Favorites", copy: "Keep the parts planned for your next build.", icon: Heart },
  { href: "/account/profile", label: "Profile & security", copy: "Update your details, preferences and password.", icon: ShieldCheck },
];

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/sign-in");

  const [{ count: orderCount }, { count: addressCount }, { count: favoriteCount }, { data: recentOrders }] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("addresses").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("favorites").select("product_id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("orders").select("id, order_number, status, total_cents, currency, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(3),
  ]);

  return <section className="flex flex-col gap-8">
    <div className="flex flex-col gap-2"><p className="text-[10px] font-black tracking-[.18em] text-brand uppercase">Member dashboard</p><h1 className="font-display text-[clamp(48px,6vw,78px)] leading-[.9] font-bold tracking-[-.035em] uppercase">Your account</h1><p className="max-w-2xl text-sm leading-6 text-foreground/55">Manage the essentials of your Basement account from one place.</p></div>

    <div className="grid grid-cols-3 gap-3 max-[600px]:grid-cols-1"><div className="flex flex-col gap-1 border border-foreground/12 bg-panel p-4"><strong className="font-display text-3xl">{orderCount ?? 0}</strong><span className="text-[9px] font-black tracking-[.08em] text-foreground/45 uppercase">Orders</span></div><div className="flex flex-col gap-1 border border-foreground/12 bg-panel p-4"><strong className="font-display text-3xl">{addressCount ?? 0}</strong><span className="text-[9px] font-black tracking-[.08em] text-foreground/45 uppercase">Addresses</span></div><div className="flex flex-col gap-1 border border-foreground/12 bg-panel p-4"><strong className="font-display text-3xl">{favoriteCount ?? 0}</strong><span className="text-[9px] font-black tracking-[.08em] text-foreground/45 uppercase">Favorites</span></div></div>

    <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">{cards.map(({ href, label, copy, icon: Icon }) => <Link className="group flex min-h-44 flex-col justify-between gap-6 border border-foreground/12 bg-panel p-5 transition hover:-translate-y-0.5 hover:border-brand" href={href} key={href}><span className="grid size-11 place-items-center border border-brand/40 text-brand"><Icon size={21} /></span><div className="flex items-end justify-between gap-5"><div className="flex flex-col gap-1"><h2 className="font-display text-2xl font-bold uppercase">{label}</h2><p className="text-xs leading-5 text-foreground/50">{copy}</p></div><ArrowRight className="shrink-0 text-brand transition group-hover:translate-x-1" size={18} /></div></Link>)}</div>

    <div className="flex flex-col gap-4"><div className="flex items-center justify-between gap-5"><h2 className="font-display text-3xl font-bold uppercase">Recent orders</h2><Link className="text-[9px] font-black text-brand uppercase" href="/account/orders">View all</Link></div>{recentOrders?.length ? <div className="flex flex-col border border-foreground/12 bg-panel">{recentOrders.map((order) => <Link className="grid grid-cols-[1fr_auto_auto] items-center gap-5 border-b border-foreground/10 p-4 last:border-b-0 max-[600px]:grid-cols-[1fr_auto]" href="/account/orders" key={order.id}><div><p className="font-display text-lg font-bold uppercase">{order.order_number}</p><p className="text-[9px] text-foreground/45">{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(order.created_at))}</p></div><span className="text-[9px] font-bold text-foreground/55 uppercase max-[600px]:hidden">{order.status.replaceAll("_", " ")}</span><strong className="text-sm text-brand">{formatPrice(order.total_cents, "en-US", order.currency)}</strong></Link>)}</div> : <p className="border border-dashed border-foreground/20 p-6 text-sm text-foreground/50">Your latest purchases will appear here.</p>}</div>
  </section>;
}
