import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin/auth";
import { adminDate } from "@/lib/admin/format";
import { formatPrice } from "@/lib/commerce";

type Address = { id: string; label: string | null; recipient_name: string; line_1: string; line_2: string | null; city: string; state_region: string | null; postal_code: string | null; country_code: string; phone: string | null; is_default_shipping: boolean };
type Order = { id: string; order_number: string; status: string; payment_status: string; total_cents: number; currency: string; created_at: string };

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await params;
  const { admin } = await requireAdmin();
  const [profileResult, authResult, addressesResult, ordersResult] = await Promise.all([
    admin.from("profiles").select("id, first_name, last_name, phone, marketing_opt_in, created_at").eq("id", customerId).maybeSingle(),
    admin.auth.admin.getUserById(customerId),
    admin.from("addresses").select("*").eq("user_id", customerId).order("is_default_shipping", { ascending: false }),
    admin.from("orders").select("id, order_number, status, payment_status, total_cents, currency, created_at").eq("user_id", customerId).order("created_at", { ascending: false }),
  ]);
  if (!profileResult.data) notFound();
  const profile = profileResult.data;
  const email = authResult.data.user?.email ?? "No email";
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Unnamed customer";
  const addresses = (addressesResult.data ?? []) as Address[];
  const orders = (ordersResult.data ?? []) as Order[];
  const paidValue = orders.filter((order) => order.payment_status === "paid").reduce((sum, order) => sum + Number(order.total_cents), 0);

  return <section className="flex flex-col gap-7"><AdminPageHeader eyebrow="Customer profile" title={fullName} description={`Customer since ${adminDate(profile.created_at)}`} action={<Link className="flex items-center gap-2 text-[9px] font-black text-foreground/50 uppercase hover:text-brand" href="/admin/customers"><ArrowLeft size={16} />Customers</Link>} />
    <div className="grid grid-cols-3 gap-4 max-[800px]:grid-cols-1"><div className="flex items-center gap-4 border border-foreground/12 bg-panel p-5"><UserRound className="text-brand" size={22} /><div className="min-w-0"><p className="truncate text-xs font-bold">{fullName}</p><p className="text-[9px] text-foreground/40">Account owner</p></div></div><a className="flex items-center gap-4 border border-foreground/12 bg-panel p-5 hover:border-brand/50" href={`mailto:${email}`}><Mail className="text-brand" size={22} /><div className="min-w-0"><p className="truncate text-xs font-bold">{email}</p><p className="text-[9px] text-foreground/40">Email address</p></div></a><div className="flex items-center gap-4 border border-foreground/12 bg-panel p-5"><Phone className="text-brand" size={22} /><div className="min-w-0"><p className="truncate text-xs font-bold">{profile.phone || "Not provided"}</p><p className="text-[9px] text-foreground/40">Phone number</p></div></div></div>
    <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(300px,.7fr)] items-start gap-5 max-lg:grid-cols-1"><section className="flex flex-col border border-foreground/12 bg-panel"><div className="flex items-end justify-between gap-5 border-b border-foreground/12 p-5"><div><h2 className="font-display text-2xl font-bold uppercase">Order history</h2><p className="text-[10px] text-foreground/45">{orders.length} orders</p></div><strong className="text-lg text-brand">{formatPrice(paidValue, "en-US", "USD")}</strong></div>{orders.length ? orders.map((order) => <Link className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-foreground/8 p-5 last:border-b-0 hover:bg-foreground/3 max-[550px]:grid-cols-[1fr_auto]" href={`/admin/orders/${order.id}`} key={order.id}><div><p className="font-display text-lg font-bold uppercase">{order.order_number}</p><p className="text-[9px] text-foreground/40">{adminDate(order.created_at)}</p></div><StatusBadge value={order.status} /><strong className="text-sm text-brand max-[550px]:col-span-2">{formatPrice(order.total_cents, "en-US", order.currency)}</strong></Link>) : <p className="p-6 text-xs text-foreground/45">This customer has no orders yet.</p>}</section><section className="flex flex-col border border-foreground/12 bg-panel"><div className="flex items-center gap-3 border-b border-foreground/12 p-5"><MapPin className="text-brand" size={19} /><h2 className="font-display text-2xl font-bold uppercase">Addresses</h2></div>{addresses.length ? addresses.map((item) => <div className="flex flex-col gap-2 border-b border-foreground/8 p-5 last:border-b-0" key={item.id}><div className="flex items-center gap-2"><strong className="text-xs">{item.label || "Address"}</strong>{item.is_default_shipping && <span className="text-[8px] font-black text-brand uppercase">Default</span>}</div><p className="text-xs leading-5 text-foreground/50">{[item.recipient_name, item.line_1, item.line_2, item.city, item.state_region, item.postal_code, item.country_code].filter(Boolean).join(", ")}</p></div>) : <p className="p-6 text-xs text-foreground/45">No saved addresses.</p>}</section></div>
  </section>;
}
