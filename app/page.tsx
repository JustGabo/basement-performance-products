"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { translations, type Locale } from "./i18n";

const categories = [
  { key: "aero" as const, image: "/images/category-aero.png" },
  { key: "bodyKits" as const, image: "/images/category-body-kits.png" },
];

const products = [
  ["Vortex R35", "Carbon front splitter", "$1,250", "72% 55%"],
  ["Apex G80", "Carbon kidney grille", "$950", "62% 52%"],
  ["Aero A90", "Carbon rear diffuser", "$1,400", "78% 68%"],
  ["Circuit FL5", "Carbon vented hood", "$1,100", "54% 56%"],
  ["GT Street Wing", "Carbon fiber rear wing", "$1,680", "52% 18%"],
  ["Ram Air System", "High-flow intake system", "$720", "18% 78%"],
  ["Track Series", "Forged performance wheel", "$890", "72% 73%"],
  ["Club Steering", "Carbon steering wheel", "$640", "48% 82%"],
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

function Icon({ name, size = 20 }: { name: "search" | "user" | "cart" | "heart" | "menu" | "arrow"; size?: number }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c.8-5 3.5-7 8-7s7.2 2 8 7" /></>,
    cart: <><path d="M3 4h2l2.2 11h10.9l2-8H6" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></>,
    heart: <path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    arrow: <path d="M5 12h14M14 7l5 5-5 5" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Logo() {
  return <a className="logo" href="#top" aria-label="Basement Performance Products home"><svg className="logo-bolt" viewBox="0 0 24 32" aria-hidden="true"><path d="M14.8 1 3 18.2h7.3L8.8 31 21 13.3h-7.4L14.8 1Z" /></svg><strong>BASEMENT</strong><span>PERFORMANCE<br />PRODUCTS</span></a>;
}

function LocaleSwitch({ locale, label, onChange }: { locale: Locale; label: string; onChange: (locale: Locale) => void }) {
  return <div className="locale-switch" role="group" aria-label={label}><button className={locale === "en" ? "active" : ""} onClick={() => onChange("en")} aria-pressed={locale === "en"}>EN</button><span>/</span><button className={locale === "es" ? "active" : ""} onClick={() => onChange("es")} aria-pressed={locale === "es"}>ES</button></div>;
}

export default function Home() {
  const [cart, setCart] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);
  const [subscribed, setSubscribed] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [locale, setLocale] = useState<Locale>("en");
  const t = translations[locale];
  const toggleSaved = (name: string) => setSaved((items) => items.includes(name) ? items.filter((item) => item !== name) : [...items, name]);

  const changeLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
    window.localStorage.setItem("basement-locale", nextLocale);
    document.documentElement.lang = nextLocale;
  };

  useEffect(() => {
    const restoreLocale = window.setTimeout(() => {
      const storedLocale = window.localStorage.getItem("basement-locale");
      if (storedLocale === "en" || storedLocale === "es") {
        setLocale(storedLocale);
        document.documentElement.lang = storedLocale;
      }
    }, 0);
    return () => window.clearTimeout(restoreLocale);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % gallerySlides.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  return <main id="top">
    <header className="header shell">
      <Logo />
      <nav aria-label="Main navigation"><a href="#shop">{t.nav.shop}</a><a href="#build-gallery">{t.nav.builds}</a><a href="#journal">{t.nav.journal}</a><a href="#about">{t.nav.about}</a></nav>
      <div className="tools"><LocaleSwitch locale={locale} label={t.language} onChange={changeLocale} /><button aria-label={t.header.search} onClick={() => document.querySelector("#products")?.scrollIntoView()}><Icon name="search" /></button><a aria-label={t.header.contact} href="mailto:hello@basementperformance.com"><Icon name="user" /></a><button aria-label={`${cart} ${t.header.cart}`} onClick={() => document.querySelector("#products")?.scrollIntoView()}><Icon name="cart" /><small>{cart}</small></button></div>
      <div className="mobile-actions"><LocaleSwitch locale={locale} label={t.language} onChange={changeLocale} /><details className="mobile-menu"><summary aria-label={t.header.menu}><Icon name="menu" size={24} /></summary><div><a href="#shop">{t.nav.shop}</a><a href="#build-gallery">{t.nav.builds}</a><a href="#journal">{t.nav.journal}</a><a href="#about">{t.nav.about}</a></div></details></div>
    </header>

    <section className="hero" aria-label={t.hero.label}>
      <div className="hero-gallery">
        {gallerySlides.map((slide, index) => <div className={`hero-slide ${index === activeSlide ? "active" : ""}`} aria-hidden={index !== activeSlide} key={slide.src}><Image src={slide.src} alt={index === activeSlide ? slide.alt : ""} fill priority={index === 0} sizes="100vw" /></div>)}
      </div>
      <div className="hero-shade" />
      <div className="shell hero-content">
        <p className="eyebrow">{t.hero.eyebrow}</p>
        <h1>{t.hero.titleOne}<br /><em>{t.hero.titleTwo}</em></h1>
        <p className="hero-copy">{t.hero.copy}</p>
        <div className="hero-actions">
          <a className="btn solid" href="#shop">{t.hero.primary} <Icon name="arrow" size={17} /></a>
          <a className="btn ghost" href="#build-gallery">{t.hero.secondary}</a>
        </div>
      </div>
      <div className="slides" aria-label={t.hero.controls}>{gallerySlides.map((_, index) => <button className={index === activeSlide ? "active" : ""} onClick={() => setActiveSlide(index)} aria-label={`${t.hero.showImage} ${index + 1}`} aria-current={index === activeSlide ? "true" : undefined} key={index}>{String(index + 1).padStart(2, "0")}</button>)}</div>
    </section>

    <section className="shell categories" id="shop" aria-label={t.categories.label}>
      {categories.map(({ key, image }) => { const category = t.categories[key]; return <a href="#products" className="category" key={key}><div className="category-photo"><Image src={image} alt={category.name} fill sizes="(max-width: 700px) 100vw, 50vw" /></div><div><h3>{category.name}</h3><p>{category.copy}</p></div><span>→</span></a>; })}
    </section>

    <section className="shell products-section" id="products">
      <div className="section-kicker">{t.products.kicker}</div>
      <div className="section-title"><h2>{t.products.title}</h2><div /><a href="#shop">{t.products.viewAll} <span>→</span></a></div>
      <div className="product-grid">{products.map(([name, part, price, pos], i) => <article className="product" key={name}>
        <div className="product-photo"><Image src={i % 2 ? "/images/performance-parts.png" : "/images/hero-car.png"} alt={name} fill sizes="(max-width: 700px) 85vw, 25vw" style={{ objectPosition: pos }} /><button className={saved.includes(name) ? "saved" : ""} aria-label={`${t.products.save} ${name}`} onClick={() => toggleSaved(name)}><Icon name="heart" size={18} /></button></div>
        <div className="product-info"><h3>{name}</h3><p>{part}</p><div><strong>{price}</strong><button aria-label={`${t.products.add}: ${name}`} onClick={() => setCart((count) => count + 1)}><Icon name="cart" size={18} /></button></div></div>
      </article>)}</div>
    </section>

    <section className="shell build-gallery" id="build-gallery">
      <div className="build-gallery-head"><div><p className="section-kicker">{t.gallery.kicker}</p><h2>{t.gallery.title}</h2></div><a className="btn ghost" href="#stories">{t.gallery.viewAll} <Icon name="arrow" size={17} /></a></div>
      <div className="build-gallery-grid">{buildGallery.map((item) => <article className="build-gallery-card" key={item.title}><Image src={item.src} alt={item.title} fill sizes="(max-width: 700px) 50vw, 50vw" /><div className="build-gallery-caption"><div><span>{item.meta}</span><h3>{item.title}</h3></div><a href="#stories">{t.gallery.view}</a></div></article>)}</div>
    </section>

    <section className="shell journal" id="journal">
      <div className="section-kicker">{t.journal.kicker}</div>
      <div className="journal-head"><h2>{t.journal.titleOne}<br />{t.journal.titleTwo}</h2><p>{t.journal.copyOne}<br />{t.journal.copyTwo}</p><a className="btn ghost" href="#stories">{t.journal.cta} <Icon name="arrow" size={17} /></a></div>
      <div className="story-grid" id="stories">{stories.map(([tag, title, copy, image, pos]) => <article className="story" key={title}><div className="story-photo"><Image src={image} alt="" fill sizes="(max-width: 700px) 100vw, 33vw" style={{ objectPosition: pos }} /></div><span>{tag}</span><h3>{title}</h3><p>{copy}</p><a href="#journal">{t.journal.readMore} →</a></article>)}</div>
    </section>

    <section className="newsletter" id="about">
      <Image src="/images/track-banner.png" alt="Performance coupe driving on a wet racetrack" fill sizes="100vw" /><div className="newsletter-shade" />
      <div className="shell newsletter-content"><div><span>{t.newsletter.kicker}</span><h2>{t.newsletter.titleOne}<br />{t.newsletter.titleTwo}</h2></div>{subscribed ? <p className="success">{t.newsletter.success}</p> : <form onSubmit={(event) => { event.preventDefault(); setSubscribed(true); }}><label className="sr-only" htmlFor="email">{t.newsletter.emailLabel}</label><input id="email" type="email" placeholder={t.newsletter.emailPlaceholder} required /><button type="submit">{t.newsletter.submit}</button></form>}</div>
    </section>

    <footer className="footer shell">
      <div className="footer-brand"><Logo /><p>{t.footer.motto}</p></div>
      <div><h4>{t.footer.shop}</h4><a href="#products">{t.footer.allProducts}</a><a href="#shop">{t.footer.aero}</a><a href="#shop">{t.footer.performance}</a><a href="#shop">{t.footer.interior}</a></div>
      <div><h4>{t.footer.company}</h4><a href="#about">{t.footer.about}</a><a href="mailto:hello@basementperformance.com">{t.footer.contact}</a><a href="#about">{t.footer.shipping}</a><a href="#about">{t.footer.returns}</a></div>
      <div><h4>{t.footer.follow}</h4><div className="socials"><a href="#top" aria-label="Instagram">IG</a><a href="#top" aria-label="YouTube">YT</a><a href="#top" aria-label="TikTok">TK</a></div></div>
      <p className="footer-callout">{t.footer.callout.map((line) => <span key={line}>{line}<br /></span>)}</p>
      <div className="legal"><span>{t.footer.copyright}</span><span>{t.footer.terms} &nbsp; {t.footer.privacy} &nbsp; {t.footer.contact}</span></div>
    </footer>
  </main>;
}
