"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { BuildImage } from "@/lib/home-content";

function isShopifyImage(src: string) {
  return src.startsWith("https://cdn.shopify.com/");
}

export function BuildGallery({ images }: { images: BuildImage[] }) {
  const [active, setActive] = useState(0);
  const image = images[active] ?? images[0];
  const hasMultiple = images.length > 1;
  const show = (index: number) => setActive((index + images.length) % images.length);

  return <div className="flex min-w-0 flex-col gap-3">
    <div className="relative aspect-[16/10] overflow-hidden border border-foreground/15 bg-panel max-[700px]:aspect-[4/3]">
      <Image className="object-cover" src={image.src} alt={image.alt} fill sizes="(max-width: 900px) 100vw, 65vw" priority unoptimized={isShopifyImage(image.src)} />
      {hasMultiple && <><button className="absolute top-1/2 left-4 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/25 bg-black/65 text-white backdrop-blur transition hover:border-brand hover:text-brand" type="button" onClick={() => show(active - 1)} aria-label="Previous image"><ChevronLeft size={22} /></button><button className="absolute top-1/2 right-4 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/25 bg-black/65 text-white backdrop-blur transition hover:border-brand hover:text-brand" type="button" onClick={() => show(active + 1)} aria-label="Next image"><ChevronRight size={22} /></button></>}
      <span className="absolute right-4 bottom-4 bg-black/70 px-3 py-1.5 text-[9px] font-black tracking-[.12em] text-white">{String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
    </div>
    {hasMultiple && <div className="flex gap-3 overflow-x-auto pb-1" aria-label="Build image thumbnails">{images.map((item, index) => <button className={`relative aspect-[4/3] w-32 shrink-0 cursor-pointer overflow-hidden border-2 transition max-[600px]:w-24 ${index === active ? "border-brand" : "border-transparent opacity-60 hover:opacity-100"}`} type="button" onClick={() => show(index)} aria-label={`Show image ${index + 1}`} aria-current={index === active} key={`${item.src}-${index}`}><Image className="object-cover" src={item.src} alt="" fill sizes="128px" unoptimized={isShopifyImage(item.src)} /></button>)}</div>}
  </div>;
}
