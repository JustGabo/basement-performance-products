import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Plus, Search } from "lucide-react";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin/auth";
import { formatPrice } from "@/lib/commerce";

type ProductRow = { id: string; name_en: string; sku: string; slug: string; status: string; price_cents: number; currency: string; inventory_quantity: number; primary_image_url: string | null; updated_at: string };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const status = typeof params.status === "string" ? params.status : "all";
  const page = Math.max(1, Number(typeof params.page === "string" ? params.page : 1) || 1);
  const pageSize = 12;
  const { admin } = await requireAdmin();

  let query = admin.from("products").select("id, name_en, sku, slug, status, price_cents, currency, inventory_quantity, primary_image_url, updated_at", { count: "exact" });
  if (search) query = query.or(`name_en.ilike.%${search}%,sku.ilike.%${search}%,slug.ilike.%${search}%`);
  if (status !== "all") query = query.eq("status", status);
  const { data, count, error } = await query.order("updated_at", { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  const products = (data ?? []) as ProductRow[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / pageSize));
  const pageHref = (next: number) => `/admin/products?${new URLSearchParams({ ...(search ? { q: search } : {}), ...(status !== "all" ? { status } : {}), page: String(next) })}`;

  return <section className="flex flex-col gap-7">
    <AdminPageHeader eyebrow="Catalog" title="Products" description="Create, publish and maintain every part available in the storefront." action={<Link className="flex min-h-12 items-center gap-3 bg-brand px-5 text-[9px] font-black text-black uppercase" href="/admin/products/new"><Plus size={17} />New product</Link>} />
    <AdminFeedback error={typeof params.error === "string" ? params.error : undefined} saved={typeof params.saved === "string" ? params.saved : undefined} />
    <form className="grid grid-cols-[minmax(220px,1fr)_180px_auto] gap-3 border border-foreground/12 bg-panel p-4 max-[650px]:grid-cols-1"><label className="flex min-h-12 items-center gap-3 border border-foreground/15 bg-ink px-4"><Search className="text-foreground/35" size={17} /><input className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-foreground/30" defaultValue={search} name="q" placeholder="Search name, SKU or slug" /></label><select className="min-h-12 border border-foreground/15 bg-ink px-4 text-base outline-none" defaultValue={status} name="status"><option value="all">All statuses</option><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option></select><button className="min-h-12 cursor-pointer bg-foreground px-6 text-[9px] font-black text-ink uppercase" type="submit">Apply filters</button></form>

    {error ? <p className="border border-red-500/30 bg-red-500/8 p-5 text-sm text-red-400">Could not load products: {error.message}</p> : products.length ? <div className="grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-[650px]:grid-cols-1">{products.map((product) => <Link className="group grid grid-cols-[112px_minmax(0,1fr)] overflow-hidden border border-foreground/12 bg-panel transition hover:border-brand/60 max-[650px]:grid-cols-1" href={`/admin/products/${product.id}`} key={product.id}><div className="relative min-h-36 bg-ink max-[650px]:aspect-[16/9] max-[650px]:min-h-0">{product.primary_image_url ? <Image className="object-cover" src={product.primary_image_url} alt={product.name_en} fill sizes="(max-width: 650px) 100vw, 112px" /> : <span className="absolute inset-0 grid place-items-center font-display text-3xl text-foreground/10">BPP</span>}</div><div className="flex min-w-0 flex-col justify-between gap-4 p-4"><div className="flex flex-col gap-2"><div className="flex items-start justify-between gap-3"><h2 className="font-display truncate text-xl font-bold uppercase">{product.name_en}</h2><StatusBadge value={product.status} /></div><p className="text-[9px] tracking-[.08em] text-foreground/40 uppercase">{product.sku}</p></div><div className="flex items-end justify-between gap-3"><div className="flex flex-col gap-1"><strong className="text-sm text-brand">{formatPrice(product.price_cents, "en-US", product.currency)}</strong><span className={`text-[9px] ${product.inventory_quantity <= 5 ? "text-red-400" : "text-foreground/40"}`}>{product.inventory_quantity} in stock</span></div><ArrowRight className="text-foreground/20 transition group-hover:text-brand" size={17} /></div></div></Link>)}</div> : <div className="flex min-h-72 flex-col items-center justify-center gap-4 border border-dashed border-foreground/20 bg-panel px-6 text-center"><h2 className="font-display text-3xl font-bold uppercase">No products found</h2><p className="text-sm text-foreground/45">Adjust the filters or create the first catalog product.</p></div>}

    {pages > 1 && <nav className="flex items-center justify-center gap-4" aria-label="Products pagination"><Link className={`grid size-11 place-items-center border border-foreground/15 ${page <= 1 ? "pointer-events-none opacity-30" : "hover:border-brand hover:text-brand"}`} href={pageHref(page - 1)} aria-label="Previous page"><ArrowLeft size={17} /></Link><span className="text-[10px] font-black uppercase">Page {page} of {pages}</span><Link className={`grid size-11 place-items-center border border-foreground/15 ${page >= pages ? "pointer-events-none opacity-30" : "hover:border-brand hover:text-brand"}`} href={pageHref(page + 1)} aria-label="Next page"><ArrowRight size={17} /></Link></nav>}
  </section>;
}
