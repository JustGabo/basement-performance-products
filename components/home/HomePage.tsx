"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, ChevronLeft, ChevronRight, Menu, Search, UserRound, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useFavorites } from "@/components/favorites/useFavorites";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { type StoreProduct } from "@/lib/commerce";
import type { BuildGalleryItem, HeroSlide } from "@/lib/home-content";
import { translations, type Locale } from "@/app/i18n";
import { ProductCard } from "@/components/shop/ProductCard";
import { persistStoreLocale } from "@/lib/store-locale-client";

const shell = "mx-auto w-[min(1480px,calc(100%_-_56px))] max-[700px]:w-[calc(100%_-_32px)]";
const display = "font-display font-bold uppercase";
const button = "inline-flex min-h-13 items-center justify-center gap-5 border px-7 text-[11px] font-black tracking-[.04em] uppercase transition max-[700px]:min-h-12 max-[700px]:px-5";

const productsPerPage = 8;

function isShopifyCdnImage(src: string) {
  try {
    return new URL(src).hostname === "cdn.shopify.com";
  } catch {
    return false;
  }
}

function Logo() {
  return <a className="[grid-area:logo] flex w-max items-center gap-5 justify-self-center max-[700px]:gap-2.5" href="#top" aria-label="Basement Performance Products home">
    <Zap className="order-none h-7 w-5 fill-brand text-brand drop-shadow-[0_0_8px_rgba(243,180,2,.2)] max-[700px]:order-2 max-[700px]:h-5.5 max-[700px]:w-4" />
    <strong className="text-[30px] leading-none font-black tracking-[-.05em] italic max-[700px]:order-1 max-[700px]:text-[23px]">BASEMENT</strong>
    <span className="border-l border-foreground/40 pl-4.5 text-[8px] leading-[1.4] font-bold tracking-[.28em] max-[700px]:hidden">PERFORMANCE<br />PRODUCTS</span>
  </a>;
}

function LocaleSwitch({ locale, label, onChange }: { locale: Locale; label: string; onChange: (locale: Locale) => void }) {
  return <div className="flex items-center gap-0.5 rounded-full border border-foreground/20 bg-panel/60 p-1" role="group" aria-label={label}>
    {(["en", "es"] as const).map((item, index) => <span className="contents" key={item}>{index > 0 && <i className="text-[9px] not-italic text-foreground/30">/</i>}<button className={`h-6 min-w-7 cursor-pointer rounded-full border-0 px-1 text-[9px] font-extrabold ${locale === item ? "bg-brand text-black" : "bg-transparent text-foreground/45"}`} onClick={() => onChange(item)} aria-pressed={locale === item}>{item.toUpperCase()}</button></span>)}
  </div>;
}

export function HomePage({ products, catalogUnavailable = false, heroSlides, buildGallery, initialLocale }: { products: StoreProduct[]; catalogUnavailable?: boolean; heroSlides: HeroSlide[]; buildGallery: BuildGalleryItem[]; initialLocale: Locale }) {
  const router = useRouter();
  const { addItem, totalItems } = useCart();
  const [activeSlide, setActiveSlide] = useState(0);
  const [productPage, setProductPage] = useState(1);
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const { isSaved, toggleFavorite } = useFavorites(locale);
  const t = translations[locale];
  const totalProductPages = Math.max(1, Math.ceil(products.length / productsPerPage));
  const visibleProducts = products.slice((productPage - 1) * productsPerPage, productPage * productsPerPage);

  const changeProductPage = (page: number) => {
    if (page < 1 || page > totalProductPages || page === productPage) return;
    setProductPage(page);
    document.querySelector("#products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const changeLocale = (next: Locale) => {
    setLocale(next);
    persistStoreLocale(next);
    router.refresh();
  };

  useEffect(() => {
    const restoreLocale = window.setTimeout(() => {
      const storedLocale = window.localStorage.getItem("basement-locale");
      if (storedLocale === "en" || storedLocale === "es") {
        setLocale(storedLocale);
        document.documentElement.setAttribute("lang", storedLocale);
        if (storedLocale !== initialLocale) {
          persistStoreLocale(storedLocale);
          router.refresh();
        }
      } else {
        persistStoreLocale(initialLocale);
      }
    }, 0);
    return () => window.clearTimeout(restoreLocale);
  }, [initialLocale, router]);

  useEffect(() => {
    const closeOnOutside = (event: PointerEvent) => {
      const menu = menuRef.current;
      if (menu?.open && !menu.contains(event.target as Node)) menu.open = false;
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuRef.current?.open) menuRef.current.open = false;
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    if (heroSlides.length < 2) return;
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % heroSlides.length), 5000);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  return <main id="top" className="overflow-hidden bg-ink text-foreground transition-colors">
    <header className="fixed top-0 left-0 z-30 grid h-21 w-full grid-cols-[1fr_auto_1fr] [grid-template-areas:'nav_logo_tools'] items-center gap-9 border-b border-foreground/12 bg-ink/88 px-[max(28px,calc((100vw-1480px)/2))] shadow-xl backdrop-blur-xl max-[1000px]:[grid-template-areas:'menu_logo_tools'] max-[700px]:h-18 max-[700px]:gap-4 max-[700px]:px-5">
      <Logo />
      <nav className="[grid-area:nav] flex gap-8 text-[10px] font-bold uppercase max-[1000px]:hidden" aria-label="Main navigation"><Link className="transition hover:text-brand" href="/shop">{t.nav.shop}</Link><Link className="transition hover:text-brand" href="/builds">{t.nav.builds}</Link><Link className="transition hover:text-brand" href="/about">{t.nav.about}</Link></nav>
      <div className="[grid-area:tools] flex items-center justify-self-end gap-4 max-[1000px]:hidden"><LocaleSwitch locale={locale} label={t.language} onChange={changeLocale} /><ThemeToggle compact /><Link className="p-1 transition hover:text-brand" aria-label={t.header.search} href="/shop?focus=search"><Search size={20} /></Link><Link className="p-1" aria-label={t.header.contact} href="/account"><UserRound size={20} /></Link><CartDrawer locale={locale} /></div>
      <details ref={menuRef} className="[grid-area:menu] relative hidden w-max justify-self-start max-[1000px]:block"><summary className="flex cursor-pointer list-none p-1 -m-1" aria-label={t.header.menu}><Menu size={24} /></summary><div className="absolute top-10 left-0 grid min-w-52 gap-4 border border-foreground/15 bg-panel/95 p-5 text-xs uppercase shadow-2xl"><div className="flex items-center justify-between gap-3"><LocaleSwitch locale={locale} label={t.language} onChange={changeLocale} /><ThemeToggle compact /></div><Link href="/shop">{t.nav.shop}</Link><Link href="/builds">{t.nav.builds}</Link><Link href="/about">{t.nav.about}</Link><Link href="/account">{t.header.contact}</Link><Link href="/cart">{totalItems} {t.header.cart}</Link></div></details>
      <div className="[grid-area:tools] hidden items-center justify-self-end max-[1000px]:flex"><CartDrawer locale={locale} /></div>
    </header>

    <section className="relative min-h-dvh overflow-hidden border-b border-foreground/10 text-white" aria-label={t.hero.label}>
      <div className="absolute inset-0">{heroSlides.map((slide, index) => <div className={`absolute inset-0 transition-opacity duration-700 ${index === activeSlide ? "opacity-100" : "opacity-0"}`} aria-hidden={index !== activeSlide} key={slide.id}><Image className="origin-top scale-[1.16] object-cover max-[700px]:origin-center max-[700px]:scale-100" src={slide.src} alt={index === activeSlide ? slide.alt : ""} fill preload={index === 0} sizes="100vw" style={{ objectPosition: slide.objectPosition }} unoptimized={isShopifyCdnImage(slide.src)} /></div>)}</div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,3,3,.96)_0%,rgba(2,3,3,.7)_30%,rgba(2,3,3,.08)_68%)] max-[700px]:bg-[linear-gradient(0deg,rgba(2,3,3,.98)_6%,rgba(2,3,3,.62)_66%,rgba(2,3,3,.18))]" />
      <div className={`${shell} relative z-10 flex min-h-dvh items-start pt-28 max-[700px]:items-end max-[700px]:pt-18 max-[700px]:pb-16`}>
        <div className="flex w-full flex-col gap-6 max-[700px]:gap-4">
          <div className="flex flex-col gap-5 max-[700px]:gap-3">
            <p className="flex items-center gap-3 text-[11px] font-black tracking-[.18em] text-brand uppercase before:h-px before:w-8 before:bg-brand max-[700px]:text-[8px] max-[700px]:tracking-[.12em]">{t.hero.eyebrow}</p>
            <h1 className={`${display} text-[clamp(56px,6.5vw,104px)] leading-[.9] tracking-[-.04em] max-[700px]:text-[clamp(26px,7.6vw,34px)] max-[700px]:leading-[1.05]`}>{t.hero.titleOne}<br />{t.hero.titleTwo}</h1>
          </div>
          <p className="max-w-[52ch] text-base leading-7 text-white/75 max-[700px]:text-sm max-[700px]:leading-6">{t.hero.copy}</p>
          <div className="flex gap-3 max-[700px]:flex-col"><Link className={`${button} border-brand bg-brand text-black hover:bg-transparent hover:text-brand max-[700px]:w-full max-[700px]:justify-between`} href="/shop">{t.hero.primary}<ArrowRight size={17} /></Link><Link className={`${button} border-brand text-brand hover:bg-brand hover:text-black max-[700px]:w-full`} href="/builds">{t.hero.secondary}</Link></div>
        </div>
      </div>
    </section>

    {/* <section className={`${shell} grid grid-cols-2 gap-5 py-6 max-[700px]:w-full max-[700px]:grid-cols-1 max-[700px]:px-4`} id="shop" aria-label={t.categories.label}>
      {categories.map(({ key, image }) => { const category = t.categories[key]; return <a href="#products" className="group relative h-80 overflow-hidden rounded-sm border border-foreground/20 text-white max-[700px]:h-75" key={key}><Image className="object-cover transition duration-500 group-hover:scale-[1.03]" src={image} alt={category.name} fill sizes="(max-width: 700px) 100vw, 50vw" /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" /><div className="absolute right-5 bottom-5 left-5 flex flex-col gap-1"><h3 className={`${display} text-3xl`}>{category.name}</h3><p className="text-xs text-white/70">{category.copy}</p></div><ArrowRight className="absolute right-5 bottom-6 text-brand" size={20} /></a>; })}
    </section> */}

    <section className={`${shell} flex scroll-mt-24 flex-col gap-6 py-12 max-[700px]:scroll-mt-20 max-[700px]:py-9`} id="products">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black tracking-[.16em] text-brand uppercase">{t.products.kicker}</p>
        <div className="flex items-center justify-between gap-5 max-[700px]:flex-col max-[700px]:items-stretch">
          <h2 className={`${display} text-[clamp(42px,5vw,72px)] leading-none max-[700px]:text-[40px]`}>{t.products.title}</h2>
          <Link className={`${button} border-brand text-brand hover:bg-brand hover:text-black max-[700px]:min-h-12 max-[700px]:w-full max-[700px]:justify-between max-[700px]:px-4 max-[700px]:text-[9px]`} href="/shop">
            {t.products.viewAll}
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
      {catalogUnavailable || products.length === 0 ? <div className="flex flex-col gap-2 border border-dashed border-foreground/20 px-6 py-16"><h3 className={`${display} text-3xl`}>{catalogUnavailable ? t.products.unavailableTitle : t.products.emptyTitle}</h3><p className="max-w-md text-sm text-foreground/55">{catalogUnavailable ? t.products.unavailableCopy : t.products.emptyCopy}</p></div> : <div className="grid grid-cols-3 gap-4 max-[1000px]:grid-cols-2 max-[700px]:grid-cols-2 max-[700px]:gap-3">
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            buildDisplay={display}
            isSaved={isSaved}
            onAdd={addItem}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>}
      {products.length > 0 && <nav className="flex items-center justify-center gap-2 pt-2" aria-label={t.products.title}>
        <button className="grid size-10 place-items-center rounded-full text-foreground/70 transition enabled:cursor-pointer enabled:hover:bg-foreground/10 disabled:text-foreground/20" type="button" onClick={() => changeProductPage(productPage - 1)} disabled={productPage === 1} aria-label={t.products.previousPage}><ChevronLeft size={19} /></button>
        {Array.from({ length: totalProductPages }, (_, index) => index + 1).map((page) => <button className={`grid size-11 cursor-pointer place-items-center rounded-full text-sm font-bold transition ${page === productPage ? "bg-brand text-black" : "text-foreground/70 hover:bg-foreground/10 hover:text-foreground"}`} type="button" onClick={() => changeProductPage(page)} aria-label={`${t.products.goToPage} ${page}`} aria-current={page === productPage ? "page" : undefined} key={page}>{page}</button>)}
        <button className="grid size-10 place-items-center rounded-full text-foreground/70 transition enabled:cursor-pointer enabled:hover:bg-foreground/10 disabled:text-foreground/20" type="button" onClick={() => changeProductPage(productPage + 1)} disabled={productPage === totalProductPages} aria-label={t.products.nextPage}><ChevronRight size={19} /></button>
      </nav>}
    </section>

    <section className={`${shell} flex flex-col gap-6 py-10 max-[700px]:gap-5 max-[700px]:py-8`} id="build-gallery">
      <div className="flex items-end justify-between gap-5 max-[700px]:flex-col max-[700px]:items-stretch max-[700px]:gap-5">
        <div className="flex flex-col gap-2"><p className="text-[10px] font-black tracking-[.16em] text-brand uppercase">{t.gallery.kicker}</p><h2 className={`${display} text-[clamp(44px,5vw,70px)] leading-none max-[700px]:text-[44px]`}>{t.gallery.title}</h2></div>
        {buildGallery.length > 0 && <Link className={`${button} border-brand text-brand hover:bg-brand hover:text-black max-[700px]:min-h-12 max-[700px]:w-full max-[700px]:justify-between max-[700px]:px-4 max-[700px]:text-[9px]`} href="/builds">{t.gallery.viewAll}<ArrowRight size={17} /></Link>}
      </div>
      {buildGallery.length > 0 ? <div className="grid auto-rows-[205px] grid-cols-2 gap-4 min-[1000px]:grid-cols-3 max-[700px]:auto-rows-[235px] max-[700px]:grid-cols-1 max-[700px]:gap-3">{buildGallery.map((item, index) => <article className={`group relative overflow-hidden rounded-sm border border-foreground/20 text-white ${index < 2 ? "min-[1000px]:row-span-2" : ""}`} key={item.id}><Link className="absolute inset-0" href={item.href} aria-label={`${t.gallery.view}: ${item.meta} ${item.title}`}><Image className="object-cover transition duration-500 group-hover:scale-[1.025]" src={item.src} alt={`${item.meta} ${item.title}`} fill sizes="(max-width: 700px) 100vw, (min-width: 1000px) 33vw, 50vw" unoptimized={isShopifyCdnImage(item.src)} /><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" /></Link><div className="pointer-events-none absolute right-5 bottom-5 left-5 flex items-end justify-between gap-4 max-[700px]:right-4 max-[700px]:bottom-4 max-[700px]:left-4"><div className="flex flex-col gap-1"><span className="text-[9px] font-black tracking-[.12em] text-brand uppercase">{item.meta}</span><h3 className={`${display} text-3xl max-[700px]:text-2xl`}>{item.title}</h3></div><span className="rounded-full bg-white px-4 py-2 text-[9px] font-black text-black uppercase max-[700px]:hidden">{t.gallery.view}</span></div></article>)}</div> : <div className="flex flex-col gap-2 border border-dashed border-foreground/20 px-6 py-16"><h3 className={`${display} text-3xl`}>{t.gallery.emptyTitle}</h3><p className="max-w-md text-sm text-foreground/55">{t.gallery.emptyCopy}</p></div>}
    </section>

    <section className="relative mt-10 mb-5 flex min-h-80 items-center overflow-hidden border-y border-foreground/15 text-white max-[700px]:min-h-[350px] max-[700px]:items-end max-[700px]:pb-8" id="about">
      <Image className="object-cover max-[700px]:object-[72%_center]" src="/images/track-banner.png" alt="Performance coupe driving on a wet racetrack" fill sizes="100vw" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,3,3,.95),rgba(2,3,3,.28))] max-[700px]:bg-[linear-gradient(0deg,rgba(2,3,3,.98)_10%,rgba(2,3,3,.65)_75%,rgba(2,3,3,.2))]" />
      <div className={`${shell} relative z-10 grid grid-cols-[1fr_auto] items-end gap-8 max-[700px]:grid-cols-1`}>
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black tracking-[.15em] text-brand uppercase">{t.newsletter.kicker}</span>
          <h2 className={`${display} text-[clamp(38px,5vw,64px)] leading-none max-[700px]:text-[32px]`}>{t.newsletter.titleOne}<br />{t.newsletter.titleTwo}</h2>
        </div>
        <a className={`${button} border-brand bg-brand text-black hover:brightness-105 max-[700px]:min-h-12 max-[700px]:w-full max-[700px]:justify-between`} href="https://www.instagram.com/danielsperformanceparts/" target="_blank" rel="noreferrer">{t.newsletter.follow}<ArrowRight size={17} /></a>
      </div>
    </section>

    <footer className={`${shell} grid grid-cols-[1.5fr_repeat(3,1fr)_1fr] gap-10 py-10 text-[10px] max-[1000px]:grid-cols-[1.5fr_repeat(3,1fr)] max-[700px]:grid-cols-2 max-[700px]:gap-8`}>
      <div className="flex flex-col gap-4 max-[700px]:col-span-full"><Logo /><p className="text-foreground/45">{t.footer.motto}</p></div>
      <div className="flex flex-col gap-2.5"><h4 className="font-black uppercase">{t.footer.shop}</h4><div className="flex flex-col gap-1.5"><Link className="text-foreground/65 hover:text-brand" href="/shop">{t.footer.allProducts}</Link><Link className="text-foreground/65 hover:text-brand" href="/shop">{t.footer.aero}</Link><Link className="text-foreground/65 hover:text-brand" href="/shop">{t.footer.bodyKits}</Link><Link className="text-foreground/65 hover:text-brand" href="/cart">{t.footer.cart}</Link></div></div>
      <div className="flex flex-col gap-2.5"><h4 className="font-black uppercase">{t.footer.company}</h4><div className="flex flex-col gap-1.5"><Link className="text-foreground/65 hover:text-brand" href="/about">{t.footer.about}</Link><Link className="text-foreground/65 hover:text-brand" href="/contact">{t.footer.contact}</Link><Link className="text-foreground/65 hover:text-brand" href="/shipping">{t.footer.shipping}</Link><Link className="text-foreground/65 hover:text-brand" href="/returns">{t.footer.returns}</Link></div></div>
      <div className="flex flex-col gap-2"><h4 className="font-black uppercase">{t.footer.follow}</h4><div className="flex gap-2.5"><a className="grid size-8.5 place-items-center border border-foreground/25 transition hover:border-brand hover:text-brand" href="https://www.instagram.com/danielsperformanceparts/" target="_blank" rel="noreferrer" aria-label="Instagram"><Camera size={16} /></a></div></div>
      <p className="border-l border-foreground/35 pl-7 text-[11px] leading-5 font-black tracking-[.2em] text-brand uppercase max-[1000px]:hidden">{t.footer.callout.map((line) => <span key={line}>{line}<br /></span>)}</p>
      <div className="col-span-full flex justify-between border-t border-foreground/15 pt-5 text-foreground/40 max-[700px]:flex-col max-[700px]:gap-3"><span>{t.footer.copyright}</span><span className="flex flex-wrap gap-4"><Link className="hover:text-brand" href="/terms">{t.footer.terms}</Link><Link className="hover:text-brand" href="/privacy">{t.footer.privacy}</Link><Link className="hover:text-brand" href="/contact">{t.footer.contact}</Link></span></div>
    </footer>
  </main>;
}
