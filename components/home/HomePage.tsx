"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, ChevronLeft, ChevronRight, Heart, Menu, Search, ShoppingCart, UserRound, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { formatPrice, type StoreProduct } from "@/lib/commerce";
import { translations, type Locale } from "@/app/i18n";

const shell = "mx-auto w-[min(1480px,calc(100%_-_56px))] max-[700px]:w-[calc(100%_-_32px)]";
const display = "font-display font-bold uppercase";
const button = "inline-flex min-h-13 items-center justify-center gap-5 border px-7 text-[11px] font-black tracking-[.04em] uppercase transition max-[700px]:min-h-12 max-[700px]:px-5";

const categories = [
  { key: "aero" as const, image: "/images/category-aero.png" },
  { key: "bodyKits" as const, image: "/images/category-body-kits.png" },
];

const stories = [
  ["Build feature", "The perfect street build", "A balance of style, grip and real-world performance.", "/images/hero-car.png", "72% 58%"],
  ["Tech", "Carbon fiber 101", "Everything you need to know before buying.", "/images/performance-parts.png", "20% 50%"],
  ["Customer build", "Track ready. Street legal.", "From a blank canvas to the complete machine.", "/images/track-banner.png", "74% 50%"],
];

const gallerySlides = [
  { src: "/images/gallery-blue-civic.png", alt: "Blue modified Civic displayed with its hood open" },
  { src: "/images/gallery-white-open.png", alt: "White modified sedan displayed with its hood open" },
  { src: "/images/gallery-white-closed.png", alt: "White lowered sedan in a covered parking structure" },
];

const buildGallery = [
  { src: "/images/build-bmw-front-lip.png", title: "Front Lip", meta: "BMW" },
  { src: "/images/build-mazda-front-splitter.png", title: "Front Splitter", meta: "Mazda" },
  { src: "/images/build-toyota-front-side-lips.png", title: "Front & Side Lips", meta: "Toyota" },
  { src: "/images/build-honda-js-racing-lip.png", title: "Front Lip JS Racing", meta: "Honda" },
];

const productsPerPage = 8;

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

export function HomePage({ products }: { products: StoreProduct[] }) {
  const { addItem, totalItems } = useCart();
  const [saved, setSaved] = useState<string[]>([]);
  const [subscribed, setSubscribed] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [productPage, setProductPage] = useState(1);
  const [locale, setLocale] = useState<Locale>("en");
  const t = translations[locale];
  const totalProductPages = Math.max(1, Math.ceil(products.length / productsPerPage));
  const visibleProducts = products.slice((productPage - 1) * productsPerPage, productPage * productsPerPage);
  const toggleSaved = (name: string) => setSaved((items) => items.includes(name) ? items.filter((item) => item !== name) : [...items, name]);

  const changeProductPage = (page: number) => {
    if (page < 1 || page > totalProductPages || page === productPage) return;
    setProductPage(page);
    document.querySelector("#products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const changeLocale = (next: Locale) => {
    setLocale(next);
    window.localStorage.setItem("basement-locale", next);
    document.documentElement.setAttribute("lang", next);
  };

  useEffect(() => {
    const restoreLocale = window.setTimeout(() => {
      const storedLocale = window.localStorage.getItem("basement-locale");
      if (storedLocale === "en" || storedLocale === "es") {
        setLocale(storedLocale);
        document.documentElement.setAttribute("lang", storedLocale);
      }
    }, 0);
    return () => window.clearTimeout(restoreLocale);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % gallerySlides.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  return <main id="top" className="overflow-hidden bg-ink text-foreground transition-colors">
    <header className="fixed top-0 left-0 z-30 grid h-21 w-full grid-cols-[1fr_auto_1fr] [grid-template-areas:'nav_logo_tools'] items-center gap-9 border-b border-foreground/12 bg-ink/88 px-[max(28px,calc((100vw-1480px)/2))] shadow-xl backdrop-blur-xl max-[1000px]:[grid-template-areas:'empty_logo_tools'] max-[700px]:h-18 max-[700px]:px-5">
      <Logo />
      <nav className="[grid-area:nav] flex gap-8 text-[10px] font-bold uppercase max-[1000px]:hidden" aria-label="Main navigation"><a className="transition hover:text-brand" href="#shop">{t.nav.shop}</a><a className="transition hover:text-brand" href="#build-gallery">{t.nav.builds}</a><a className="transition hover:text-brand" href="#journal">{t.nav.journal}</a><Link className="transition hover:text-brand" href="/about">{t.nav.about}</Link></nav>
      <div className="[grid-area:tools] flex items-center justify-self-end gap-4 max-[1000px]:hidden"><LocaleSwitch locale={locale} label={t.language} onChange={changeLocale} /><ThemeToggle compact /><button className="cursor-pointer border-0 bg-transparent p-1" aria-label={t.header.search} onClick={() => document.querySelector("#products")?.scrollIntoView()}><Search size={20} /></button><Link className="p-1" aria-label={t.header.contact} href="/account"><UserRound size={20} /></Link><CartDrawer locale={locale} /></div>
      <div className="[grid-area:tools] hidden items-center justify-self-end gap-2 max-[1000px]:flex"><ThemeToggle compact /><CartDrawer locale={locale} /><details className="relative"><summary className="flex cursor-pointer list-none p-1" aria-label={t.header.menu}><Menu size={24} /></summary><div className="absolute top-10 right-0 grid min-w-44 gap-4 border border-foreground/15 bg-panel/95 p-5 text-xs uppercase shadow-2xl"><LocaleSwitch locale={locale} label={t.language} onChange={changeLocale} /><a href="#shop">{t.nav.shop}</a><a href="#build-gallery">{t.nav.builds}</a><a href="#journal">{t.nav.journal}</a><Link href="/about">{t.nav.about}</Link><Link href="/account">{t.header.contact}</Link><Link href="/cart">{totalItems} {t.header.cart}</Link></div></details></div>
    </header>

    <section className="relative min-h-175 overflow-hidden border-b border-foreground/10 text-white max-[700px]:min-h-147.5" aria-label={t.hero.label}>
      <div className="absolute inset-0">{gallerySlides.map((slide, index) => <div className={`absolute inset-0 transition-opacity duration-700 ${index === activeSlide ? "opacity-100" : "opacity-0"}`} aria-hidden={index !== activeSlide} key={slide.src}><Image className="object-cover object-center max-[700px]:object-[64%_center]" src={slide.src} alt={index === activeSlide ? slide.alt : ""} fill priority={index === 0} sizes="100vw" /></div>)}</div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,3,3,.96)_0%,rgba(2,3,3,.7)_30%,rgba(2,3,3,.08)_68%)] max-[700px]:bg-[linear-gradient(0deg,rgba(2,3,3,.98)_6%,rgba(2,3,3,.62)_66%,rgba(2,3,3,.18))]" />
      <div className={`${shell} relative z-10 flex min-h-175 items-center pt-21 max-[700px]:min-h-147.5 max-[700px]:items-end max-[700px]:pt-18 max-[700px]:pb-16`}>
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-5">
            <p className="text-[11px] font-black tracking-[.18em] text-brand uppercase">{t.hero.eyebrow}</p>
            <h1 className={`${display} text-[clamp(68px,8vw,132px)] leading-[.84] tracking-[-.045em] max-[700px]:text-[54px]`}>{t.hero.titleOne}<br /><em className="not-italic text-brand">{t.hero.titleTwo}</em></h1>
          </div>
          <p className="max-w-150 text-xs font-semibold tracking-[.08em] uppercase max-[700px]:max-w-80 max-[700px]:text-[9px]">{t.hero.copy}</p>
          <div className="flex gap-3"><a className={`${button} border-brand bg-brand text-black hover:bg-transparent hover:text-brand`} href="#shop">{t.hero.primary}<ArrowRight size={17} /></a><a className={`${button} border-brand text-brand hover:bg-brand hover:text-black`} href="#build-gallery">{t.hero.secondary}</a></div>
        </div>
      </div>
      <div className="absolute right-[max(28px,calc((100vw-1480px)/2))] bottom-7 z-10 flex gap-3 max-[700px]:hidden" aria-label={t.hero.controls}>{gallerySlides.map((_, index) => <button className={`cursor-pointer border-0 border-b-2 bg-transparent px-1 pb-2 text-[10px] font-bold ${index === activeSlide ? "border-brand text-white" : "border-white/20 text-white/55"}`} onClick={() => setActiveSlide(index)} aria-label={`${t.hero.showImage} ${index + 1}`} aria-current={index === activeSlide ? "true" : undefined} key={index}>{String(index + 1).padStart(2, "0")}</button>)}</div>
    </section>

    <section className={`${shell} grid grid-cols-2 gap-5 py-6 max-[700px]:w-full max-[700px]:grid-cols-1 max-[700px]:px-4`} id="shop" aria-label={t.categories.label}>
      {categories.map(({ key, image }) => { const category = t.categories[key]; return <a href="#products" className="group relative h-80 overflow-hidden rounded-sm border border-foreground/20 text-white max-[700px]:h-75" key={key}><Image className="object-cover transition duration-500 group-hover:scale-[1.03]" src={image} alt={category.name} fill sizes="(max-width: 700px) 100vw, 50vw" /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" /><div className="absolute right-5 bottom-5 left-5 flex flex-col gap-1"><h3 className={`${display} text-3xl`}>{category.name}</h3><p className="text-xs text-white/70">{category.copy}</p></div><ArrowRight className="absolute right-5 bottom-6 text-brand" size={20} /></a>; })}
    </section>

    <section className={`${shell} flex scroll-mt-24 flex-col gap-6 py-12 max-[700px]:scroll-mt-20 max-[700px]:py-9`} id="products">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black tracking-[.16em] text-brand uppercase">{t.products.kicker}</p>
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-5 max-[700px]:grid-cols-[1fr_auto]">
          <h2 className={`${display} text-4xl leading-5 lg:text-[clamp(42px,5vw,72px)] lg:leading-none lg:max-[700px]:text-[40px]`}>{t.products.title}</h2>
          <div className="h-px bg-foreground/20 max-[700px]:hidden" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 max-[1000px]:grid-cols-2 max-[700px]:grid-cols-2 max-[700px]:gap-3">{visibleProducts.map((product) => <article className="min-w-0 overflow-hidden rounded-sm border border-foreground/20 bg-panel" key={product.id}>
        <div className="relative h-60 overflow-hidden max-[700px]:h-[155px]"><Link className="absolute inset-0" href={`/products/${product.slug}`} aria-label={product.name}><Image className="object-cover transition duration-500 hover:scale-[1.025]" src={product.image} alt={product.name} fill sizes="(max-width: 700px) 50vw, 25vw" style={{ objectPosition: product.objectPosition }} /></Link><button className={`absolute top-3 left-3 z-10 grid size-9 cursor-pointer place-items-center rounded-full border border-white/25 bg-black/50 backdrop-blur max-[700px]:top-2 max-[700px]:left-2 max-[700px]:size-8 ${saved.includes(product.name) ? "text-brand" : "text-white"}`} aria-label={`${t.products.save} ${product.name}`} onClick={() => toggleSaved(product.name)}><Heart className={saved.includes(product.name) ? "fill-current" : ""} size={17} /></button></div>
        <div className="flex flex-col gap-4 p-4 max-[700px]:gap-3 max-[700px]:p-3">
          <div className="flex flex-col gap-0.5">
            <h3 className={`${display} truncate text-lg max-[700px]:text-[15px]`}><Link className="hover:text-brand" href={`/products/${product.slug}`}>{product.name}</Link></h3>
            <p className="truncate text-[10px] uppercase text-foreground/60 max-[700px]:text-[8px]">{product.part}</p>
          </div>
          <div className="flex items-center justify-between">
            <strong className="text-lg max-[700px]:text-[15px]">{formatPrice(product.priceCents)}</strong>
            <button className="grid size-9 cursor-pointer place-items-center rounded-sm bg-brand text-black max-[700px]:size-8" aria-label={`${t.products.add}: ${product.name}`} onClick={() => addItem(product)}><ShoppingCart size={17} /></button>
          </div>
        </div>
      </article>)}</div>
      <nav className="flex items-center justify-center gap-2 pt-2" aria-label={t.products.title}>
        <button className="grid size-10 place-items-center rounded-full text-foreground/70 transition enabled:cursor-pointer enabled:hover:bg-foreground/10 disabled:text-foreground/20" type="button" onClick={() => changeProductPage(productPage - 1)} disabled={productPage === 1} aria-label={t.products.previousPage}><ChevronLeft size={19} /></button>
        {Array.from({ length: totalProductPages }, (_, index) => index + 1).map((page) => <button className={`grid size-11 cursor-pointer place-items-center rounded-full text-sm font-bold transition ${page === productPage ? "bg-brand text-black" : "text-foreground/70 hover:bg-foreground/10 hover:text-foreground"}`} type="button" onClick={() => changeProductPage(page)} aria-label={`${t.products.goToPage} ${page}`} aria-current={page === productPage ? "page" : undefined} key={page}>{page}</button>)}
        <button className="grid size-10 place-items-center rounded-full text-foreground/70 transition enabled:cursor-pointer enabled:hover:bg-foreground/10 disabled:text-foreground/20" type="button" onClick={() => changeProductPage(productPage + 1)} disabled={productPage === totalProductPages} aria-label={t.products.nextPage}><ChevronRight size={19} /></button>
      </nav>
    </section>

    <section className={`${shell} flex flex-col gap-6 py-10 max-[700px]:gap-5 max-[700px]:py-8`} id="build-gallery">
      <div className="flex items-end justify-between gap-5 max-[700px]:flex-col max-[700px]:items-stretch max-[700px]:gap-5">
        <div className="flex flex-col gap-2"><p className="text-[10px] font-black tracking-[.16em] text-brand uppercase">{t.gallery.kicker}</p><h2 className={`${display} text-[clamp(44px,5vw,70px)] leading-none max-[700px]:text-[44px]`}>{t.gallery.title}</h2></div>
        <a className={`${button} border-brand text-brand hover:bg-brand hover:text-black max-[700px]:min-h-12 max-[700px]:w-full max-[700px]:justify-between max-[700px]:px-4 max-[700px]:text-[9px]`} href="#stories">{t.gallery.viewAll}<ArrowRight size={17} /></a>
      </div>
      <div className="grid auto-rows-[205px] grid-cols-2 gap-4 min-[1000px]:grid-cols-3 max-[700px]:auto-rows-[235px] max-[700px]:grid-cols-1 max-[700px]:gap-3">{buildGallery.map((item, index) => <article className={`group relative overflow-hidden rounded-sm border border-foreground/20 text-white ${index < 2 ? "min-[1000px]:row-span-2" : ""}`} key={item.title}><Image className="object-cover transition duration-500 group-hover:scale-[1.025]" src={item.src} alt={item.title} fill sizes="(max-width: 700px) 100vw, (min-width: 1000px) 33vw, 50vw" /><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" /><div className="absolute right-5 bottom-5 left-5 flex items-end justify-between gap-4 max-[700px]:right-4 max-[700px]:bottom-4 max-[700px]:left-4"><div className="flex flex-col gap-1"><span className="text-[9px] font-black tracking-[.12em] text-brand uppercase">{item.meta}</span><h3 className={`${display} text-3xl max-[700px]:text-2xl`}>{item.title}</h3></div><a className="rounded-full bg-white px-4 py-2 text-[9px] font-black text-black uppercase max-[700px]:hidden" href="#stories">{t.gallery.view}</a></div></article>)}</div>
    </section>

    <section className={`${shell} flex flex-col gap-7 py-14`} id="journal">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black tracking-[.16em] text-brand uppercase">{t.journal.kicker}</p>
        <div className="grid grid-cols-[1fr_auto_auto] items-end gap-8 max-[700px]:flex max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-5"><h2 className={`${display} text-[clamp(46px,6vw,82px)] leading-[.9] max-[700px]:text-[40px]`}>{t.journal.titleOne}<br />{t.journal.titleTwo}</h2><p className="text-xs leading-5 text-foreground/60 max-[1000px]:hidden">{t.journal.copyOne}<br />{t.journal.copyTwo}</p><a className={`${button} border-brand text-brand hover:bg-brand hover:text-black`} href="#stories">{t.journal.cta}<ArrowRight size={17} /></a></div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-foreground/15 max-[700px]:grid-cols-1 max-[700px]:divide-none max-[700px]:gap-9" id="stories">{stories.map(([tag, title, copy, image, pos]) => <article className="flex flex-col gap-4 px-4 first:pl-0 last:pr-0 max-[700px]:px-0" key={title}><div className="relative h-60 overflow-hidden max-[700px]:h-[225px]"><Image className="object-cover" src={image} alt="" fill sizes="(max-width: 700px) 100vw, 33vw" style={{ objectPosition: pos }} /></div><div className="flex flex-col gap-4"><div className="flex flex-col gap-1"><span className="text-[9px] font-black tracking-[.12em] text-brand uppercase">{tag}</span><h3 className={`${display} text-2xl`}>{title}</h3></div><p className="text-xs text-foreground/60">{copy}</p><a className="inline-flex text-[10px] font-bold text-brand" href="#journal">{t.journal.readMore} →</a></div></article>)}</div>
    </section>

    <section className="relative flex min-h-75 items-center overflow-hidden border-y border-foreground/15 text-white max-[700px]:min-h-[350px] max-[700px]:items-end max-[700px]:pb-8" id="about">
      <Image className="object-cover max-[700px]:object-[72%_center]" src="/images/track-banner.png" alt="Performance coupe driving on a wet racetrack" fill sizes="100vw" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,3,3,.95),rgba(2,3,3,.28))] max-[700px]:bg-[linear-gradient(0deg,rgba(2,3,3,.98)_10%,rgba(2,3,3,.65)_75%,rgba(2,3,3,.2))]" />
      <div className={`${shell} relative z-10 grid grid-cols-[1fr_auto] items-end gap-8 max-[700px]:grid-cols-1`}><div className="flex flex-col gap-2"><span className="text-[10px] font-black tracking-[.15em] text-brand uppercase">{t.newsletter.kicker}</span><h2 className={`${display} text-[clamp(38px,5vw,64px)] leading-none max-[700px]:text-[32px]`}>{t.newsletter.titleOne}<br />{t.newsletter.titleTwo}</h2></div>{subscribed ? <p className="text-sm text-brand">{t.newsletter.success}</p> : <form className="flex h-12" onSubmit={(event) => { event.preventDefault(); setSubscribed(true); }}><label className="sr-only" htmlFor="email">{t.newsletter.emailLabel}</label><input className="min-w-64 border border-white/30 bg-black/55 px-4 text-xs outline-none focus:border-brand max-[700px]:min-w-0 max-[700px]:flex-1" id="email" type="email" placeholder={t.newsletter.emailPlaceholder} required /><button className="w-36 cursor-pointer bg-brand text-[10px] font-black text-black uppercase max-[700px]:w-30" type="submit">{t.newsletter.submit}</button></form>}</div>
    </section>

    <footer className={`${shell} grid grid-cols-[1.5fr_repeat(3,1fr)_1fr] gap-10 py-10 text-[10px] max-[1000px]:grid-cols-[1.5fr_repeat(3,1fr)] max-[700px]:grid-cols-2 max-[700px]:gap-8`}>
      <div className="flex flex-col gap-4 max-[700px]:col-span-full"><Logo /><p className="text-foreground/45">{t.footer.motto}</p></div>
      <div className="flex flex-col gap-2.5"><h4 className="font-black uppercase">{t.footer.shop}</h4><div className="flex flex-col gap-1.5"><Link className="text-foreground/65 hover:text-brand" href="/#products">{t.footer.allProducts}</Link><Link className="text-foreground/65 hover:text-brand" href="/#shop">{t.footer.aero}</Link><Link className="text-foreground/65 hover:text-brand" href="/#shop">{t.footer.bodyKits}</Link><Link className="text-foreground/65 hover:text-brand" href="/cart">{t.footer.cart}</Link></div></div>
      <div className="flex flex-col gap-2.5"><h4 className="font-black uppercase">{t.footer.company}</h4><div className="flex flex-col gap-1.5"><Link className="text-foreground/65 hover:text-brand" href="/about">{t.footer.about}</Link><Link className="text-foreground/65 hover:text-brand" href="/contact">{t.footer.contact}</Link><Link className="text-foreground/65 hover:text-brand" href="/shipping">{t.footer.shipping}</Link><Link className="text-foreground/65 hover:text-brand" href="/returns">{t.footer.returns}</Link></div></div>
      <div className="flex flex-col gap-2"><h4 className="font-black uppercase">{t.footer.follow}</h4><div className="flex gap-2.5"><a className="grid size-8.5 place-items-center border border-foreground/25 transition hover:border-brand hover:text-brand" href="https://www.instagram.com/danielsperformanceparts/" target="_blank" rel="noreferrer" aria-label="Instagram"><Camera size={16} /></a></div></div>
      <p className="border-l border-foreground/35 pl-7 text-[11px] leading-5 font-black tracking-[.2em] text-brand uppercase max-[1000px]:hidden">{t.footer.callout.map((line) => <span key={line}>{line}<br /></span>)}</p>
      <div className="col-span-full flex justify-between border-t border-foreground/15 pt-5 text-foreground/40 max-[700px]:flex-col max-[700px]:gap-3"><span>{t.footer.copyright}</span><span className="flex flex-wrap gap-4"><Link className="hover:text-brand" href="/terms">{t.footer.terms}</Link><Link className="hover:text-brand" href="/privacy">{t.footer.privacy}</Link><Link className="hover:text-brand" href="/contact">{t.footer.contact}</Link></span></div>
    </footer>
  </main>;
}
