"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Camera, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { BrandLogo } from "@/components/site/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { persistStoreLocale } from "@/lib/store-locale-client";

type Locale = "en" | "es";
type LocalizedText = { en: string; es: string };
type Section = { title: LocalizedText; body: LocalizedText };

type ContentPageProps = {
  eyebrow: LocalizedText;
  title: LocalizedText;
  intro: LocalizedText;
  sections: Section[];
  draft?: boolean;
};

const routes = [
  { href: "/about", en: "About", es: "Nosotros" },
  { href: "/contact", en: "Contact", es: "Contacto" },
  { href: "/shipping", en: "Shipping", es: "Envíos" },
  { href: "/returns", en: "Returns", es: "Devoluciones" },
  { href: "/terms", en: "Terms", es: "Términos" },
  { href: "/privacy", en: "Privacy", es: "Privacidad" },
];

export function ContentPage({ eyebrow, title, intro, sections, draft = false }: ContentPageProps) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const stored = window.localStorage.getItem("basement-locale");
      if (stored === "en" || stored === "es") setLocale(stored);
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  const changeLocale = (next: Locale) => {
    setLocale(next);
    persistStoreLocale(next);
  };

  return <main className="min-h-svh bg-ink text-foreground transition-colors">
    <header className="sticky top-0 z-30 border-b border-foreground/12 bg-ink/88 backdrop-blur-xl">
      <div className="mx-auto grid h-20 w-[min(1480px,calc(100%_-_56px))] grid-cols-[1fr_auto_1fr] items-center gap-5 max-[700px]:h-16 max-[700px]:w-[calc(100%_-_32px)]">
        <Link className="flex w-fit items-center gap-2 text-[10px] font-black tracking-[.08em] text-foreground/60 uppercase transition hover:text-brand" href="/"><ArrowLeft size={17} />{locale === "en" ? "Shop" : "Tienda"}</Link>
        <BrandLogo compact />
        <div className="flex items-center justify-self-end gap-2"><div className="flex items-center rounded-full border border-foreground/15 bg-panel/70 p-1 max-[600px]:hidden" aria-label={locale === "en" ? "Language" : "Idioma"}>{(["en", "es"] as const).map((item) => <button className={`h-7 min-w-8 cursor-pointer rounded-full text-[9px] font-black ${locale === item ? "bg-brand text-black" : "text-foreground/45"}`} key={item} onClick={() => changeLocale(item)} type="button">{item.toUpperCase()}</button>)}</div><ThemeToggle compact /><CartDrawer locale={locale} /></div>
      </div>
    </header>

    <section className="border-b border-foreground/12 bg-panel/45">
      <div className="mx-auto flex w-[min(1180px,calc(100%_-_56px))] flex-col gap-2 lg:gap-5 py-16 max-[700px]:w-[calc(100%_-_32px)] max-[700px]:py-10">
        <p className="text-[10px] font-black tracking-[.18em] text-brand uppercase">{eyebrow[locale]}</p>
        <h1 className="max-w-5xl font-display text-4xl lg:text-[clamp(54px,8vw,112px)] leading-[1] lg:leading-[.86] font-bold tracking-[-.045em] uppercase">{title[locale]}</h1>
        <p className="max-w-2xl text-sm leading-6 text-foreground/58">{intro[locale]}</p>
        {draft && <p className="w-fit border border-brand/35 bg-brand/8 px-3 py-2 text-[9px] font-black tracking-[.08em] text-brand uppercase">{locale === "en" ? "Draft structure — final copy pending" : "Estructura preliminar — texto final pendiente"}</p>}
      </div>
    </section>

    <div className="mx-auto grid w-[min(1180px,calc(100%_-_56px))] grid-cols-[220px_minmax(0,1fr)] items-start gap-12 py-14 max-[800px]:grid-cols-1 max-[700px]:w-[calc(100%_-_32px)] max-[700px]:gap-8 max-[700px]:py-9">
      <aside className="sticky top-28 max-[800px]:static"><details className="group border border-foreground/12 bg-panel max-[800px]:block" open><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-[10px] font-black tracking-[.08em] uppercase"><span>{locale === "en" ? "Information" : "Información"}</span><Menu className="hidden max-[800px]:block" size={17} /></summary><nav className="flex flex-col border-t border-foreground/10">{routes.map((route) => <Link className="flex min-h-11 items-center justify-between gap-3 border-b border-foreground/8 px-4 text-[10px] text-foreground/60 transition last:border-b-0 hover:bg-brand hover:text-black" href={route.href} key={route.href}>{route[locale]}<ArrowRight size={13} /></Link>)}</nav></details></aside>
      <div className="flex flex-col gap-4">{sections.map((section, index) => <article className="flex flex-col gap-3 border border-foreground/12 bg-panel p-6 max-[600px]:p-5" key={section.title.en}><span className="text-[9px] font-black tracking-[.12em] text-brand">{String(index + 1).padStart(2, "0")}</span><h2 className="font-display text-3xl font-bold uppercase">{section.title[locale]}</h2><p className="max-w-3xl text-sm leading-7 text-foreground/58">{section.body[locale]}</p></article>)}</div>
    </div>

    <footer className="border-t border-foreground/12"><div className="mx-auto flex w-[min(1180px,calc(100%_-_56px))] items-center justify-between gap-6 py-8 text-[9px] text-foreground/45 max-[700px]:w-[calc(100%_-_32px)] max-[600px]:flex-col max-[600px]:items-start"><span>© 2026 Basement Performance Products.</span><div className="flex flex-wrap items-center gap-5"><Link className="hover:text-brand" href="/terms">{locale === "en" ? "Terms" : "Términos"}</Link><Link className="hover:text-brand" href="/privacy">{locale === "en" ? "Privacy" : "Privacidad"}</Link><a className="flex items-center gap-2 hover:text-brand" href="https://www.instagram.com/danielsperformanceparts/" rel="noreferrer" target="_blank"><Camera size={14} />Instagram</a></div></div></footer>
  </main>;
}
