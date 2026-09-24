import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/commerce";
import { createClient } from "@/lib/supabase/server";

type Favorite = { product_id: string; products: { slug: string; name_en: string; short_description_en: string | null; price_cents: number; currency: string; primary_image_url: string | null } | null };

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/sign-in");
  const { data, error } = await supabase.from("favorites").select("product_id, products(slug, name_en, short_description_en, price_cents, currency, primary_image_url)").eq("user_id", userId).order("created_at", { ascending: false });
  const favorites = (data ?? []) as unknown as Favorite[];

  return <section className="flex flex-col gap-8">
    <div className="flex flex-col gap-2"><p className="text-[10px] font-black tracking-[.18em] text-brand uppercase">Saved for later</p><h1 className="font-display text-[clamp(48px,6vw,78px)] leading-[.9] font-bold tracking-[-.035em] uppercase">Favorites</h1><p className="max-w-2xl text-sm leading-6 text-foreground/55">Keep a shortlist of parts for your current and future builds.</p></div>
    {error || favorites.length === 0 ? <div className="flex min-h-80 flex-col items-center justify-center gap-5 border border-dashed border-foreground/20 bg-panel px-6 text-center"><span className="grid size-14 place-items-center rounded-full border border-brand/40 text-brand"><Heart size={24} /></span><div className="flex flex-col gap-2"><h2 className="font-display text-3xl font-bold uppercase">No favorites yet</h2><p className="max-w-md text-sm text-foreground/50">Save the parts you want to compare or purchase later.</p></div><Link className="flex min-h-12 items-center gap-3 bg-brand px-6 text-[10px] font-black text-black uppercase" href="/#products">Explore products<ShoppingBag size={17} /></Link></div> : <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[550px]:grid-cols-1">{favorites.map((favorite) => favorite.products && <article className="overflow-hidden border border-foreground/15 bg-panel" key={favorite.product_id}><div className="relative h-48 bg-ink">{favorite.products.primary_image_url ? <Image className="object-cover" src={favorite.products.primary_image_url} alt={favorite.products.name_en} fill sizes="(max-width: 550px) 100vw, 33vw" /> : <span className="absolute inset-0 grid place-items-center text-foreground/15"><Heart size={38} /></span>}</div><div className="flex flex-col gap-4 p-4"><div className="flex flex-col gap-1"><h2 className="font-display text-xl font-bold uppercase">{favorite.products.name_en}</h2><p className="truncate text-[10px] text-foreground/50 uppercase">{favorite.products.short_description_en ?? "Performance part"}</p></div><strong className="text-brand">{formatPrice(favorite.products.price_cents, "en-US", favorite.products.currency)}</strong></div></article>)}</div>}
  </section>;
}
