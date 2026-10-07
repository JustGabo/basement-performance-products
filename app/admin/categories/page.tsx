import { FolderTree, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { createCategory, toggleCategory } from "@/app/admin/actions";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CategoryActions } from "@/components/admin/CategoryActions";
import { requireAdmin } from "@/lib/admin/auth";

type CategoryRow = { id: string; slug: string; name_en: string; name_es: string; description_en: string | null; description_es: string | null; is_active: boolean; product_categories: Array<{ count: number }> };
const input = "min-h-12 w-full border border-foreground/18 bg-ink px-4 text-base outline-none focus:border-brand";
const label = "flex flex-col gap-2 text-[9px] font-black tracking-[.08em] text-foreground/65 uppercase";

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const params = await searchParams;
  const { admin } = await requireAdmin();
  const { data, error } = await admin.from("categories").select("id, slug, name_en, name_es, description_en, description_es, is_active, product_categories(count)").order("sort_order").order("name_en");
  const categories = (data ?? []) as CategoryRow[];

  return <section className="flex flex-col gap-7">
    <AdminPageHeader eyebrow="Catalog organization" title="Categories" description="Group products into storefront collections and hide categories that are not ready for customers." />
    <AdminFeedback error={params.error} saved={params.saved} />
    <div className="grid grid-cols-[minmax(320px,.75fr)_minmax(0,1.25fr)] items-start gap-5 max-lg:grid-cols-1">
      <form action={createCategory} className="flex flex-col gap-5 border border-foreground/12 bg-panel p-6 max-[600px]:p-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center bg-brand text-black"><Plus size={18} /></span><div className="flex flex-col gap-1"><h2 className="font-display text-2xl font-bold uppercase">New category</h2><p className="text-[10px] text-foreground/45">English and Spanish storefront labels</p></div></div><label className={label}>English name<input className={input} name="name_en" required /></label><label className={label}>Spanish name<input className={input} name="name_es" /></label><label className={label}>URL slug<input className={input} name="slug" placeholder="Generated automatically" /></label><label className={label}>Description · EN<textarea className={`${input} min-h-28 py-3`} name="description_en" /></label><label className={label}>Description · ES<textarea className={`${input} min-h-28 py-3`} name="description_es" /></label><button className="min-h-12 cursor-pointer bg-brand px-6 text-[9px] font-black text-black uppercase" type="submit">Create category</button></form>
      <div className="flex flex-col border border-foreground/12 bg-panel"><div className="flex items-center gap-3 border-b border-foreground/12 p-5"><FolderTree className="text-brand" size={20} /><h2 className="font-display text-2xl font-bold uppercase">Storefront categories</h2></div>{error ? <p className="p-5 text-sm text-red-400">{error.message}</p> : categories.length ? categories.map((category) => <article className="flex items-center justify-between gap-5 border-b border-foreground/10 p-5 last:border-b-0 max-[650px]:items-start max-[650px]:flex-col" key={category.id}><div className="flex min-w-0 flex-col gap-1"><div className="flex items-center gap-3"><h3 className="font-display text-xl font-bold uppercase">{category.name_en}</h3><span className={`size-2 rounded-full ${category.is_active ? "bg-emerald-500" : "bg-foreground/20"}`} /></div><p className="text-[10px] text-foreground/45">/{category.slug} · {category.name_es}</p><p className="line-clamp-2 text-xs leading-5 text-foreground/50">{category.description_en || "No description yet."}</p></div><div className="flex shrink-0 items-center gap-3"><span className="text-[9px] font-black text-foreground/40 uppercase">{category.product_categories?.[0]?.count ?? 0} products</span><form action={toggleCategory}><input name="id" type="hidden" value={category.id} /><input name="is_active" type="hidden" value={String(category.is_active)} /><button className="grid size-10 cursor-pointer place-items-center border border-foreground/15 text-brand" type="submit" aria-label={category.is_active ? "Hide category" : "Activate category"}>{category.is_active ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}</button></form><CategoryActions category={category} /></div></article>) : <p className="p-8 text-sm text-foreground/45">No categories created yet.</p>}</div>
    </div>
  </section>;
}
