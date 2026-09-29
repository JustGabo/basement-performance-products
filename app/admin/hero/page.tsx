import Image from "next/image";
import { Eye, EyeOff, ImagePlus, Trash2 } from "lucide-react";
import { addHeroSlides, deleteHeroSlide, toggleHeroSlide } from "@/app/admin/actions";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { ImageUploadPreview } from "@/components/admin/ImageUploadPreview";
import { requireAdmin } from "@/lib/admin/auth";

type Slide = { id: string; image_url: string; alt_en: string; is_active: boolean; sort_order: number; object_position: string };

const input = "min-h-12 w-full border border-foreground/18 bg-ink px-4 text-sm outline-none transition placeholder:text-foreground/25 focus:border-brand";
const label = "flex flex-col gap-2 text-[9px] font-black tracking-[.08em] text-foreground/65 uppercase";

export default async function AdminHeroPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const params = await searchParams;
  const { admin } = await requireAdmin();
  const { data, error } = await admin.from("hero_slides").select("id, image_url, alt_en, is_active, sort_order, object_position").order("sort_order").limit(10);
  const slides = (data ?? []) as Slide[];
  const remaining = Math.max(0, 10 - slides.length);

  return <section className="flex flex-col gap-7">
    <AdminPageHeader eyebrow="Storefront media" title="Hero gallery" description="Control the full-width images that rotate every five seconds on the storefront. Up to 10 images can be selected." />
    <AdminFeedback error={params.error} saved={params.saved} />
    {error ? <p className="border border-red-800/45 bg-red-950/25 p-5 text-sm text-red-400">The hero gallery table is not available yet: {error.message}. Run the latest Supabase migration, then reload this page.</p> : <>
      <section className="flex flex-col gap-5 border border-foreground/12 bg-panel p-6 max-[600px]:p-4">
        <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><ImagePlus className="text-brand" size={20} /><div className="flex flex-col gap-1"><h2 className="font-display text-2xl font-bold uppercase">Add hero images</h2><p className="text-xs text-foreground/45">Files stay in a local preview until you submit this form.</p></div></div><strong className="shrink-0 text-sm text-brand">{slides.length}/10</strong></div>
        {remaining ? <form action={addHeroSlides} className="flex flex-col gap-5"><ImageUploadPreview label="New hero images" maxFiles={remaining} multiple name="hero_images" required /><div className="grid grid-cols-3 gap-4 max-[750px]:grid-cols-1"><label className={label}>Alternative text · EN<input className={input} name="alt_en" placeholder="Describe the featured vehicle" /></label><label className={label}>Alternative text · ES<input className={input} name="alt_es" placeholder="Describe el vehículo destacado" /></label><label className={label}>Crop focus<select className={input} name="object_position" defaultValue="center"><option value="center">Center</option><option value="center top">Top</option><option value="center bottom">Bottom</option><option value="left center">Left</option><option value="right center">Right</option></select></label></div><button className="flex min-h-12 w-fit cursor-pointer items-center gap-3 bg-brand px-6 text-[9px] font-black text-black uppercase" type="submit"><ImagePlus size={17} />Add to hero</button></form> : <p className="border border-brand/25 bg-brand/5 p-4 text-xs text-brand">The 10-image limit is full. Remove an image before adding another.</p>}
      </section>

      <section className="flex flex-col gap-5 border border-foreground/12 bg-panel p-6 max-[600px]:p-4"><div className="flex flex-col gap-1"><h2 className="font-display text-2xl font-bold uppercase">Current selection</h2><p className="text-xs text-foreground/45">All active images rotate automatically in this order.</p></div>{slides.length ? <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[480px]:grid-cols-1">{slides.map((slide, index) => <article className="flex flex-col overflow-hidden border border-foreground/12 bg-ink" key={slide.id}><div className="relative aspect-video"><Image className="object-cover" src={slide.image_url} alt={slide.alt_en} fill sizes="(max-width: 480px) 100vw, (max-width: 900px) 50vw, 33vw" style={{ objectPosition: slide.object_position }} /><span className="absolute top-3 left-3 grid size-8 place-items-center bg-black/75 text-[9px] font-black text-white">{index + 1}</span></div><div className="flex items-center justify-between gap-3 p-3"><span className={`text-[8px] font-black uppercase ${slide.is_active ? "text-emerald-400" : "text-foreground/35"}`}>{slide.is_active ? "Active" : "Hidden"}</span><div className="flex items-center gap-2"><form action={toggleHeroSlide}><input name="id" type="hidden" value={slide.id} /><input name="is_active" type="hidden" value={String(slide.is_active)} /><button className="grid size-10 cursor-pointer place-items-center border border-foreground/15 transition hover:border-brand hover:text-brand" type="submit" aria-label={slide.is_active ? "Hide image" : "Activate image"}>{slide.is_active ? <EyeOff size={17} /> : <Eye size={17} />}</button></form><ConfirmAction action={deleteHeroSlide} fields={{ id: slide.id }} title="Remove hero image?" description="This image will stop appearing in the storefront hero. This action cannot be undone." confirmLabel="Remove image" trigger={<button className="grid size-10 cursor-pointer place-items-center border border-red-800/45 text-red-400 transition hover:bg-red-950/60" type="button" aria-label="Remove hero image"><Trash2 size={17} /></button>} /></div></div></article>)}</div> : <p className="border border-dashed border-foreground/20 p-8 text-center text-sm text-foreground/45">No managed hero images yet. The storefront is currently using its bundled fallback gallery.</p>}</section>
    </>}
  </section>;
}
