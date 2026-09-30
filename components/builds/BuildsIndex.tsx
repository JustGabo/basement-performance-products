import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BuildLayout, buildDisplay, buildShell } from "@/components/builds/BuildShell";
import type { BuildGalleryItem } from "@/lib/home-content";

function isShopifyImage(src: string) {
  return src.startsWith("https://cdn.shopify.com/");
}

export function BuildsIndex({ builds }: { builds: BuildGalleryItem[] }) {
  return <BuildLayout>
    <section className={`${buildShell} flex flex-col gap-10 py-16 max-[700px]:gap-7 max-[700px]:py-10`}>
      <div className="flex max-w-4xl flex-col gap-4"><span className="text-[10px] font-black tracking-[.18em] text-brand uppercase">From the community</span><h1 className={`${buildDisplay} text-[clamp(62px,9vw,132px)] leading-[.82] tracking-[-.04em]`}>Built in the<br /><span className="text-brand">Basement.</span></h1><p className="max-w-2xl text-sm leading-6 text-foreground/55">Real cars, real owners and the fiberglass modifications that make every build distinct.</p></div>
      <div className="grid grid-cols-2 gap-5 max-[760px]:grid-cols-1">{builds.map((build) => <Link className="group relative aspect-[16/10] overflow-hidden border border-foreground/15 bg-panel text-white max-[500px]:aspect-[4/3]" href={build.href} key={build.id}><Image className="object-cover transition duration-500 group-hover:scale-[1.025]" src={build.src} alt={`${build.meta} ${build.model} ${build.title}`} fill sizes="(max-width: 760px) 100vw, 50vw" unoptimized={isShopifyImage(build.src)} /><div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/5 to-transparent" /><div className="absolute right-6 bottom-6 left-6 flex items-end justify-between gap-4 max-[500px]:right-4 max-[500px]:bottom-4 max-[500px]:left-4"><div className="flex flex-col gap-1"><span className="text-[9px] font-black tracking-[.15em] text-brand uppercase">{build.meta}{build.model ? ` · ${build.model}` : ""}</span><h2 className={`${buildDisplay} text-4xl leading-none max-[500px]:text-2xl`}>{build.title}</h2></div><span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-black transition group-hover:bg-brand"><ArrowRight size={18} /></span></div></Link>)}</div>
    </section>
  </BuildLayout>;
}
