import Link from "next/link";
import { AlertTriangle, ArrowRight, Boxes, CircleDollarSign, PackageCheck, UsersRound } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin/auth";
import { adminDate } from "@/lib/admin/format";
import { formatPrice } from "@/lib/commerce";

type RecentOrder = { id: string; order_number: string; email: string; status: string; total_cents: number; currency: string; created_at: string };
type LowStockProduct = { id: string; name_en: string; sku: string; inventory_quantity: number };

export default async function AdminOverviewPage() {
  const { admin, fullName } = await requireAdmin();
  const [productsResult, ordersResult, customersResult, revenueResult, recentResult, lowStockResult] = await Promise.all([
    admin.from("products").select("id", { count: "exact", head: true }).neq("status", "archived"),
    admin.from("orders").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    admin.from("orders").select("total_cents").eq("payment_status", "paid"),
    admin.from("orders").select("id, order_number, email, status, total_cents, currency, created_at").order("created_at", { ascending: false }).limit(5),
    admin.from("products").select("id, name_en, sku, inventory_quantity").eq("track_inventory", true).lte("inventory_quantity", 5).neq("status", "archived").order("inventory_quantity").limit(5),
  ]);

  const revenue = (revenueResult.data ?? []).reduce((sum, row) => sum + Number(row.total_cents), 0);
  const recentOrders = (recentResult.data ?? []) as RecentOrder[];
  const lowStock = (lowStockResult.data ?? []) as LowStockProduct[];
  const metrics = [
    { label: "Catalog products", value: String(productsResult.count ?? 0), icon: Boxes, href: "/admin/products" },
    { label: "Total orders", value: String(ordersResult.count ?? 0), icon: PackageCheck, href: "/admin/orders" },
    { label: "Customers", value: String(customersResult.count ?? 0), icon: UsersRound, href: "/admin/customers" },
    { label: "Paid revenue", value: formatPrice(revenue, "en-US", "USD"), icon: CircleDollarSign, href: "/admin/orders?payment=paid" },
  ];

  return <section className="flex flex-col gap-9">
    <AdminPageHeader eyebrow="Control room" title={`Welcome, ${fullName.split(" ")[0]}.`} description="A live snapshot of the storefront, orders and inventory that need your attention." action={<Link className="flex min-h-12 items-center gap-4 bg-brand px-5 text-[9px] font-black text-black uppercase" href="/admin/products/new">Add product<ArrowRight size={16} /></Link>} />

    <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-[560px]:grid-cols-1">{metrics.map(({ label, value, icon: Icon, href }) => <Link className="group flex min-h-36 flex-col justify-between gap-5 border border-foreground/12 bg-panel p-5 transition hover:border-brand/60" href={href} key={label}><div className="flex items-center justify-between gap-4"><span className="grid size-10 place-items-center border border-brand/30 text-brand"><Icon size={19} /></span><ArrowRight className="text-foreground/25 transition group-hover:text-brand" size={17} /></div><div className="flex flex-col gap-1"><strong className="font-display text-3xl font-bold uppercase">{value}</strong><span className="text-[9px] font-black tracking-[.1em] text-foreground/45 uppercase">{label}</span></div></Link>)}</div>

    <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)] items-start gap-5 max-xl:grid-cols-1">
      <section className="flex flex-col border border-foreground/12 bg-panel"><div className="flex items-center justify-between gap-5 border-b border-foreground/12 p-5"><div className="flex flex-col gap-1"><h2 className="font-display text-2xl font-bold uppercase">Recent orders</h2><p className="text-[10px] text-foreground/45">Latest storefront activity</p></div><Link className="text-[9px] font-black text-brand uppercase" href="/admin/orders">View all</Link></div>{recentOrders.length ? <div className="flex flex-col">{recentOrders.map((order) => <Link className="grid grid-cols-[minmax(120px,1fr)_minmax(160px,1.4fr)_auto_auto] items-center gap-4 border-b border-foreground/8 px-5 py-4 last:border-b-0 hover:bg-foreground/3 max-[700px]:grid-cols-[1fr_auto]" href={`/admin/orders/${order.id}`} key={order.id}><div className="flex flex-col gap-1"><strong className="font-display text-lg uppercase">{order.order_number}</strong><span className="text-[9px] text-foreground/40">{adminDate(order.created_at)}</span></div><span className="truncate text-xs text-foreground/55 max-[700px]:hidden">{order.email}</span><StatusBadge value={order.status} /><strong className="text-sm text-brand max-[700px]:col-span-2">{formatPrice(order.total_cents, "en-US", order.currency)}</strong></Link>)}</div> : <p className="p-8 text-sm text-foreground/45">No orders have been placed yet.</p>}</section>

      <section className="flex flex-col border border-foreground/12 bg-panel"><div className="flex items-center gap-3 border-b border-foreground/12 p-5"><AlertTriangle className="text-brand" size={19} /><div className="flex flex-col gap-1"><h2 className="font-display text-2xl font-bold uppercase">Low inventory</h2><p className="text-[10px] text-foreground/45">Five units or fewer</p></div></div>{lowStock.length ? <div className="flex flex-col">{lowStock.map((product) => <Link className="flex items-center justify-between gap-5 border-b border-foreground/8 px-5 py-4 last:border-b-0 hover:bg-foreground/3" href={`/admin/products/${product.id}`} key={product.id}><div className="min-w-0"><p className="truncate text-xs font-bold">{product.name_en}</p><p className="text-[9px] text-foreground/40">{product.sku}</p></div><strong className={product.inventory_quantity === 0 ? "text-red-400" : "text-brand"}>{product.inventory_quantity}</strong></Link>)}</div> : <p className="p-8 text-sm text-foreground/45">Inventory levels look healthy.</p>}</section>
    </div>
  </section>;
}
