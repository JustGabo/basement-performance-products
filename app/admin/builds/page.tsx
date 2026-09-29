import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin/auth";

type BuildRow = { id: string; vehicle_brand: string; vehicle_model: string | null; modification_en: string; cover_image_url: string; is_published: boolean; sort_order: number };

export default async function AdminBuildsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const params = await searchParams;
  const { admin } = await requireAdmin();
  const { data, error } = await admin.from("builds").select("id, vehicle_brand, vehicle_model, modification_en, cover_image_url, is_published, sort_order").order("sort_order").order("created_at", { ascending: false });
  const builds = (data ?? []) as BuildRow[];
  return <section className="flex flex-col gap-7"><AdminPageHeader eyebrow="Community gallery" title="Builds" description="Manage the customer and workshop projects featured below the product catalog." action={<Link className="flex min-h-12 items-center gap-3 bg-brand px-5 text-[9px] font-black text-black uppercase" href="/admin/builds/new"><Plus size={17} />New build</Link>} /><AdminFeedback error={params.error} saved={params.saved} />{error ? <p className="border border-red-500/30 bg-red-500/8 p-5 text-sm text-red-400">{error.message}</p> : builds.length ? <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">{builds.map((build) => <Link className="group relative min-h-72 overflow-hidden border border-foreground/12 bg-panel" href={`/admin/builds/${build.id}`} key={build.id}><Image className="object-cover transition duration-500 group-hover:scale-[1.02]" src={build.cover_image_url} alt={`${build.vehicle_brand} ${build.modification_en}`} fill sizes="(max-width: 700px) 100vw, 50vw" /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" /><div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-5 text-white"><div className="flex min-w-0 flex-col gap-2"><StatusBadge value={build.is_published ? "published" : "draft"} /><p className="text-[9px] font-black tracking-[.12em] text-brand uppercase">{build.vehicle_brand} {build.vehicle_model}</p><h2 className="font-display truncate text-3xl font-bold uppercase">{build.modification_en}</h2></div><ArrowRight className="shrink-0 text-brand" size={20} /></div></Link>)}</div> : <div className="flex min-h-72 flex-col items-center justify-center gap-3 border border-dashed border-foreground/20 bg-panel px-6 text-center"><h2 className="font-display text-3xl font-bold uppercase">No builds yet</h2><p className="text-sm text-foreground/45">Add the first community project to start the gallery.</p></div>}</section>;
}
