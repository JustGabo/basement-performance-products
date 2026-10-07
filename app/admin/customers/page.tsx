import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { adminDate } from "@/lib/admin/format";
import { formatPrice } from "@/lib/commerce";

type Profile = { id: string; first_name: string | null; last_name: string | null; phone: string | null; marketing_opt_in: boolean; created_at: string };
type CustomerOrder = { user_id: string; total_cents: number; payment_status: string };

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const search = q.trim().toLowerCase();
  const { admin } = await requireAdmin();
  const [profilesResult, usersResult, ordersResult] = await Promise.all([
    admin.from("profiles").select("id, first_name, last_name, phone, marketing_opt_in, created_at").eq("role", "customer").order("created_at", { ascending: false }),
    admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
    admin.from("orders").select("user_id, total_cents, payment_status"),
  ]);
  const emails = new Map(usersResult.data.users.map((user) => [user.id, user.email ?? ""]));
  const orderStats = new Map<string, { count: number; revenue: number }>();
  for (const order of (ordersResult.data ?? []) as CustomerOrder[]) {
    const current = orderStats.get(order.user_id) ?? { count: 0, revenue: 0 };
    current.count += 1;
    if (order.payment_status === "paid") current.revenue += Number(order.total_cents);
    orderStats.set(order.user_id, current);
  }
  const profiles = ((profilesResult.data ?? []) as Profile[]).filter((profile) => {
    if (!search) return true;
    return `${profile.first_name ?? ""} ${profile.last_name ?? ""} ${emails.get(profile.id) ?? ""}`.toLowerCase().includes(search);
  });

  return <section className="flex flex-col gap-7"><AdminPageHeader eyebrow="Customer records" title="Customers" description="Review account details, order activity and saved shipping information." />
    <form className="flex gap-3 border border-foreground/12 bg-panel p-4 max-[550px]:flex-col"><label className="flex min-h-12 flex-1 items-center gap-3 border border-foreground/15 bg-ink px-4"><Search className="text-foreground/35" size={17} /><input className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-foreground/30" defaultValue={q} name="q" placeholder="Search name or email" /></label><button className="min-h-12 cursor-pointer bg-foreground px-6 text-[9px] font-black text-ink uppercase" type="submit">Search</button></form>
    {profilesResult.error || usersResult.error ? <p className="border border-red-500/30 bg-red-500/8 p-5 text-sm text-red-400">Customer records could not be loaded.</p> : profiles.length ? <div className="grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-[650px]:grid-cols-1">{profiles.map((profile) => {
      const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Unnamed customer";
      const stats = orderStats.get(profile.id) ?? { count: 0, revenue: 0 };
      return <Link className="group flex flex-col gap-5 border border-foreground/12 bg-panel p-5 transition hover:border-brand/60" href={`/admin/customers/${profile.id}`} key={profile.id}><div className="flex items-center gap-3"><span className="grid size-11 shrink-0 place-items-center bg-brand text-black"><UserRound size={19} /></span><div className="min-w-0"><h2 className="truncate font-display text-xl font-bold uppercase">{name}</h2><p className="truncate text-[10px] text-foreground/45">{emails.get(profile.id) || "No email"}</p></div></div><div className="grid grid-cols-2 gap-3 border-y border-foreground/10 py-4"><div className="flex flex-col gap-1"><strong className="text-lg">{stats.count}</strong><span className="text-[8px] font-black text-foreground/35 uppercase">Orders</span></div><div className="flex flex-col gap-1"><strong className="text-lg text-brand">{formatPrice(stats.revenue, "en-US", "USD")}</strong><span className="text-[8px] font-black text-foreground/35 uppercase">Paid value</span></div></div><div className="flex items-center justify-between gap-4 text-[9px] text-foreground/40"><span>Joined {adminDate(profile.created_at)}</span><span className="font-black uppercase transition group-hover:text-brand">View profile</span></div></Link>;
    })}</div> : <div className="flex min-h-72 flex-col items-center justify-center gap-3 border border-dashed border-foreground/20 bg-panel px-6 text-center"><h2 className="font-display text-3xl font-bold uppercase">No customers found</h2><p className="text-sm text-foreground/45">New accounts will appear here.</p></div>}
  </section>;
}
