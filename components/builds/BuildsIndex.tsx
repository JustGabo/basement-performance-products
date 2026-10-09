"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BuildLayout } from "@/components/builds/BuildShell";
import type { StoreLocale } from "@/lib/commerce/locale";
import type { BuildGalleryItem } from "@/lib/home-content";

const buildShell = "mx-auto w-[min(1480px,calc(100%-56px))] max-[700px]:w-[calc(100%-32px)]";

const copy = {
  en: {
    title: "Built in the Basement",
    line: "Real cars and the people who build them here.",
    empty: "New builds will appear here.",
    previous: "Previous builds",
    next: "Next builds",
    gallery: "Build gallery",
  },
  es: {
    title: "Hechos en el Basement",
    line: "Autos reales y las personas que los construyen aquí.",
    empty: "Los nuevos proyectos aparecerán aquí.",
    previous: "Proyectos anteriores",
    next: "Proyectos siguientes",
    gallery: "Galería de proyectos",
  },
} as const;

function isShopifyImage(src: string) {
  return src.startsWith("https://cdn.shopify.com/");
}

function BuildFrame({ build, featured = false }: { build: BuildGalleryItem; featured?: boolean }) {
  const label = `${build.meta}${build.model ? ` ${build.model}` : ""} ${build.title}`;

  return (
    <Link className="group flex h-full min-h-0 min-w-0 flex-col gap-3 max-[700px]:gap-0" href={build.href} aria-label={label}>
      <span className="relative block min-h-48 flex-1 overflow-hidden bg-[#ddd9d2] dark:bg-panel max-[700px]:min-h-0">
        <Image
          className="object-cover transition duration-700 group-hover:scale-[1.025]"
          src={build.src}
          alt={label}
          fill
          sizes={featured ? "(max-width: 700px) 72vw, 42vw" : "(max-width: 700px) 14vw, 26vw"}
          unoptimized={isShopifyImage(build.src)}
        />
      </span>
      {featured ? (
        <span className="flex h-5 items-center justify-between gap-4 text-[11px] tracking-[.16em] text-[#6d6a64] uppercase dark:text-foreground/50 max-[700px]:hidden">
          <span className="truncate">{build.title}</span>
          <span className="shrink-0 text-right">{build.model || build.meta}</span>
        </span>
      ) : (
        <span className="block h-5 truncate text-center text-[11px] leading-5 tracking-[.16em] text-[#6d6a64] uppercase dark:text-foreground/50 max-[700px]:hidden">{build.meta}</span>
      )}
    </Link>
  );
}

const desktopLayout = { side: 26, center: 42, gap: 3 };
const mobileLayout = { side: 12, center: 72, gap: 2 };

function BuildCarousel({ builds, label, previousLabel, nextLabel }: { builds: BuildGalleryItem[]; label: string; previousLabel: string; nextLabel: string }) {
  const [active, setActive] = useState(Math.min(1, builds.length - 1));
  const [layout, setLayout] = useState(desktopLayout);
  const touchStart = useRef<number | null>(null);
  const current = builds[active];

  useEffect(() => {
    const query = window.matchMedia("(max-width: 700px)");
    const update = () => setLayout(query.matches ? mobileLayout : desktopLayout);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const move = (direction: -1 | 1) => {
    setActive((current) => Math.min(builds.length - 1, Math.max(0, current + direction)));
  };

  const centerStart = layout.side + layout.gap;
  const offset = centerStart - active * (layout.side + layout.gap);

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden max-[700px]:flex-none max-[700px]:gap-3"
      aria-label={label}
      role="region"
      onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const distance = event.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(distance) > 40) move(distance < 0 ? 1 : -1);
        touchStart.current = null;
      }}
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden max-[700px]:h-[min(52vw,240px)] max-[700px]:flex-none">
        {builds.length > 1 && (
          <>
            <button className="absolute top-[calc(50%-1.25rem)] left-0 z-10 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-black/10 bg-white/80 text-black backdrop-blur transition enabled:hover:bg-white disabled:cursor-default disabled:opacity-30 max-[700px]:top-1/2 max-[700px]:size-9 dark:border-white/15 dark:bg-black/55 dark:text-white dark:enabled:hover:bg-black/75" type="button" onClick={() => move(-1)} disabled={active === 0} aria-label={previousLabel}>
              <ChevronLeft size={20} />
            </button>
            <button className="absolute top-[calc(50%-1.25rem)] right-0 z-10 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-black/10 bg-white/80 text-black backdrop-blur transition enabled:hover:bg-white disabled:cursor-default disabled:opacity-30 max-[700px]:top-1/2 max-[700px]:size-9 dark:border-white/15 dark:bg-black/55 dark:text-white dark:enabled:hover:bg-black/75" type="button" onClick={() => move(1)} disabled={active === builds.length - 1} aria-label={nextLabel}>
              <ChevronRight size={20} />
            </button>
          </>
        )}
        <div
          className="flex min-h-0 flex-1 items-stretch transition-transform duration-500 ease-out"
          style={{ transform: `translateX(${offset}%)`, gap: `${layout.gap}%` }}
        >
          {builds.map((build, index) => {
            const featured = index === active;
            return (
              <div
                className="flex shrink-0 flex-col self-stretch transition-[flex-basis] duration-500 ease-out"
                style={{ flexBasis: `${featured ? layout.center : layout.side}%` }}
                aria-hidden={Math.abs(index - active) > 1}
                key={build.id}
              >
                <BuildFrame build={build} featured={featured} />
              </div>
            );
          })}
        </div>
      </div>
      {current && (
        <p className="hidden min-h-4 truncate px-8 text-center text-[9px] tracking-[.14em] text-[#6d6a64] uppercase max-[700px]:block dark:text-foreground/50">
          {current.meta}
          {current.model ? ` ${current.model}` : ""} · {current.title}
        </p>
      )}
    </div>
  );
}

export function BuildsIndex({ builds, locale }: { builds: BuildGalleryItem[]; locale: StoreLocale }) {
  const text = copy[locale];

  return (
    <BuildLayout>
      <section className="flex min-h-0 flex-1 flex-col bg-[#e7e5e1] text-[#171717] dark:bg-ink dark:text-foreground">
        <div className={`${buildShell} flex min-h-0 flex-1 flex-col gap-6 py-6 max-[700px]:justify-center max-[700px]:gap-8 max-[700px]:py-8`}>
          {builds.length ? (
            <BuildCarousel builds={builds} label={text.gallery} previousLabel={text.previous} nextLabel={text.next} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-black/15 px-6 py-20 text-center dark:border-foreground/20">
              <p className="font-display text-3xl font-bold uppercase">{text.empty}</p>
            </div>
          )}
          <div className="flex shrink-0 flex-col items-center gap-3 text-center max-[700px]:gap-2">
            <h1 className="max-w-full font-display text-[clamp(40px,6.2vw,108px)] leading-[.84] font-bold tracking-[-.045em] uppercase max-[700px]:text-[32px] max-[700px]:leading-[.9]">
              {text.title}
            </h1>
            <p className="max-w-xl text-sm leading-6 text-[#5f5c57] dark:text-foreground/55 max-[700px]:max-w-[34ch] max-[700px]:text-xs max-[700px]:leading-5">{text.line}</p>
          </div>
        </div>
      </section>
    </BuildLayout>
  );
}
