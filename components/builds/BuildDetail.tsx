import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BuildGallery } from "@/components/builds/BuildGallery";
import { BuildLayout, buildDisplay, buildShell } from "@/components/builds/BuildShell";
import type { BuildGalleryItem } from "@/lib/home-content";

export function BuildDetail({ build }: { build: BuildGalleryItem }) {
  return <BuildLayout backHref="/builds" backLabel="All builds">
    <article className={`${buildShell} grid grid-cols-[minmax(0,1.55fr)_minmax(320px,.75fr)] gap-12 py-12 max-[950px]:grid-cols-1 max-[700px]:gap-8 max-[700px]:py-6`}>
      <BuildGallery images={build.images} />
      <div className="flex flex-col gap-8 py-5 max-[950px]:py-0">
        <div className="flex flex-col gap-4"><span className="text-[10px] font-black tracking-[.18em] text-brand uppercase">Community build</span><div className="flex flex-col gap-2"><p className="text-xs font-black tracking-[.15em] text-foreground/50 uppercase">{build.meta}{build.model ? ` · ${build.model}` : ""}</p><h1 className={`${buildDisplay} text-[clamp(58px,7vw,104px)] leading-[.84] tracking-[-.04em]`}>{build.title}</h1></div></div>
        <div className="h-px bg-foreground/15" />
        <div className="flex flex-col gap-3"><h2 className="text-[10px] font-black tracking-[.14em] text-brand uppercase">About the build</h2><p className="text-sm leading-7 text-foreground/60">{build.description || `A Basement community build featuring a custom ${build.title.toLowerCase()} for this ${build.meta} ${build.model}.`}</p></div>
        <div className="grid grid-cols-2 gap-3 max-[430px]:grid-cols-1"><Link className="flex min-h-13 items-center justify-center gap-3 border border-brand text-[10px] font-black text-brand uppercase transition hover:bg-brand hover:text-black" href="/builds"><ArrowLeft size={16} />All builds</Link><Link className="flex min-h-13 items-center justify-center gap-3 bg-brand px-4 text-[10px] font-black text-black uppercase transition hover:bg-[#d99f00]" href="/#products">Shop parts<ArrowRight size={16} /></Link></div>
      </div>
    </article>
  </BuildLayout>;
}
