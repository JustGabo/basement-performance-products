"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Camera, Check, ChevronLeft, ChevronRight, Heart, Minus, Plus, Share2, ShieldCheck, ShoppingCart, Truck, UserRound, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useCart } from "@/components/cart/CartProvider";
import { BrandLogo } from "@/components/site/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { formatPrice, type StoreProduct } from "@/lib/commerce";

type Locale = "en" | "es";

const copy = {
  en: {
    back: "Back to products", account: "Customer account", cart: "items in cart", product: "Performance product",
    stock: "In stock", unavailable: "Currently unavailable", quantity: "Quantity", add: "Add to cart", buy: "Buy now",
    save: "Save", saved: "Saved", share: "Share", description: "Description", compatibility: "Compatibility",
    shipping: "Shipping & returns", defaultDescription: "Built for a precise, aggressive finish with durable materials selected for real street and track use.",
    defaultCompatibility: "Confirm year, make, model and trim with our team before installation.",
    shippingCopy: "Shipping is calculated at checkout. Inspect fitment before painting, drilling or permanent installation.",
    secure: "Secure checkout", support: "Fitment support", delivery: "Local & international delivery", added: "Added to your cart",
    previous: "Previous image", next: "Next image", previousThumbs: "Previous thumbnails", nextThumbs: "Next thumbnails",
    relatedKicker: "Complete the build", related: "Similar products", view: "View product", footerShop: "Shop", footerCompany: "Company",
    allProducts: "All products", about: "About us", contact: "Contact", terms: "Terms", privacy: "Privacy", footerMotto: "Performance products. Real builds. Built in the basement.",
  },
  es: {
    back: "Volver a productos", account: "Cuenta de cliente", cart: "artículos en el carrito", product: "Producto de rendimiento",
    stock: "Disponible", unavailable: "No disponible actualmente", quantity: "Cantidad", add: "Agregar al carrito", buy: "Comprar ahora",
    save: "Guardar", saved: "Guardado", share: "Compartir", description: "Descripción", compatibility: "Compatibilidad",
    shipping: "Envíos y devoluciones", defaultDescription: "Diseñado para una terminación precisa y agresiva, con materiales duraderos para uso real en calle y pista.",
    defaultCompatibility: "Confirma año, marca, modelo y versión con nuestro equipo antes de instalar.",
    shippingCopy: "El envío se calcula al pagar. Revisa el ajuste antes de pintar, perforar o instalar permanentemente.",
    secure: "Pago seguro", support: "Soporte de compatibilidad", delivery: "Entrega local e internacional", added: "Agregado al carrito",
    previous: "Imagen anterior", next: "Imagen siguiente", previousThumbs: "Miniaturas anteriores", nextThumbs: "Miniaturas siguientes",
    relatedKicker: "Completa el proyecto", related: "Productos similares", view: "Ver producto", footerShop: "Tienda", footerCompany: "Compañía",
    allProducts: "Todos los productos", about: "Nosotros", contact: "Contacto", terms: "Términos", privacy: "Privacidad", footerMotto: "Productos de rendimiento. Proyectos reales. Hecho en el basement.",
  },
} as const;

const fallbackImages = [
  "/images/performance-parts.png",
  "/images/category-aero.png",
  "/images/category-body-kits.png",
  "/images/hero-car.png",
  "/images/track-banner.png",
];

function buildGallery(product: StoreProduct) {
  const supplied = product.images?.map((image) => ({ src: image.url, alt: image.alt })) ?? [];
  const images = [{ src: product.image, alt: product.name }, ...supplied, ...fallbackImages.map((src) => ({ src, alt: product.name }))];
  return images.filter((image, index) => images.findIndex((candidate) => candidate.src === image.src) === index);
}

export function ProductDetail({ product, relatedProducts }: { product: StoreProduct; relatedProducts: StoreProduct[] }) {
  const router = useRouter();
  const { addItem } = useCart();
  const images = useMemo(() => buildGallery(product), [product]);
  const [locale, setLocale] = useState<Locale>("en");
  const [activeImage, setActiveImage] = useState(0);
  const [thumbnailStart, setThumbnailStart] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);
  const t = copy[locale];
  const inStock = product.inventoryQuantity === undefined || product.inventoryQuantity > 0;
  const visibleImages = images.slice(thumbnailStart, thumbnailStart + 4);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem("basement-locale");
      if (stored === "en" || stored === "es") setLocale(stored);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const selectImage = (index: number) => {
    const next = (index + images.length) % images.length;
    setActiveImage(next);
    if (next < thumbnailStart) setThumbnailStart(next);
    if (next >= thumbnailStart + 4) setThumbnailStart(Math.min(next, images.length - 4));
  };

  const addToCart = () => {
    addItem(product, quantity);
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: product.name, url });
    else await navigator.clipboard.writeText(url);
  };

  return <main className="min-h-svh bg-ink text-foreground transition-colors">
    <header className="sticky top-0 z-40 border-b border-foreground/12 bg-ink/88 backdrop-blur-xl">
      <div className="mx-auto grid h-20 w-[min(1480px,calc(100%_-_56px))] grid-cols-[1fr_auto_1fr] items-center gap-6 max-[700px]:h-16 max-[700px]:w-[calc(100%_-_32px)]">
        <Link className="flex w-fit items-center gap-2 text-[10px] font-black tracking-[.06em] text-foreground/60 uppercase hover:text-brand" href="/#products"><ArrowLeft size={17} /><span className="max-[520px]:hidden">{t.back}</span></Link>
        <BrandLogo />
        <div className="flex items-center justify-end gap-3"><ThemeToggle compact /><Link className="p-1 max-[520px]:hidden" href="/account" aria-label={t.account}><UserRound size={19} /></Link><CartDrawer locale={locale} /></div>
      </div>
    </header>

    <div className="mx-auto flex w-[min(1380px,calc(100%_-_56px))] flex-col gap-10 py-10 max-[700px]:w-[calc(100%_-_32px)] max-[700px]:gap-7 max-[700px]:py-6">
      <nav className="flex items-center gap-2 text-[9px] font-bold tracking-[.08em] text-foreground/45 uppercase"><Link className="hover:text-brand" href="/">Shop</Link><ChevronRight size={12} /><span>{product.part}</span></nav>

      <section className="grid grid-cols-[minmax(0,1.08fr)_minmax(380px,.92fr)] items-start gap-12 max-[1000px]:grid-cols-1 max-[1000px]:gap-8">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="relative min-h-145 overflow-hidden rounded-sm border border-foreground/15 bg-panel max-[1200px]:min-h-125 max-[700px]:min-h-95">
            <Image className="object-cover" src={images[activeImage].src} alt={images[activeImage].alt} fill priority sizes="(max-width: 1000px) 100vw, 55vw" style={{ objectPosition: product.objectPosition }} />
            <span className="absolute top-4 left-4 bg-brand px-3 py-2 text-[9px] font-black tracking-[.12em] text-black uppercase">Carbon series</span>
            {images.length > 1 && <><button className="absolute top-1/2 left-4 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/25 bg-black/65 text-white backdrop-blur hover:border-brand hover:text-brand" type="button" onClick={() => selectImage(activeImage - 1)} aria-label={t.previous}><ChevronLeft size={21} /></button><button className="absolute top-1/2 right-4 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/25 bg-black/65 text-white backdrop-blur hover:border-brand hover:text-brand" type="button" onClick={() => selectImage(activeImage + 1)} aria-label={t.next}><ChevronRight size={21} /></button></>}
          </div>

          <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2">
            <button className="grid size-11 place-items-center border border-foreground/15 text-foreground/55 enabled:cursor-pointer enabled:hover:border-brand enabled:hover:text-brand disabled:opacity-20" type="button" onClick={() => setThumbnailStart((start) => Math.max(0, start - 1))} disabled={thumbnailStart === 0} aria-label={t.previousThumbs}><ChevronLeft size={18} /></button>
            <div className="grid h-25 grid-cols-4 gap-2 overflow-hidden">{visibleImages.map((image, index) => { const absoluteIndex = thumbnailStart + index; return <button className={`relative min-w-0 cursor-pointer overflow-hidden border bg-panel ${absoluteIndex === activeImage ? "border-brand" : "border-foreground/15 hover:border-foreground/40"}`} type="button" onClick={() => selectImage(absoluteIndex)} aria-label={`${product.name} ${absoluteIndex + 1}`} aria-current={absoluteIndex === activeImage ? "true" : undefined} key={`${image.src}-${absoluteIndex}`}><Image className="object-cover" src={image.src} alt="" fill sizes="140px" style={{ objectPosition: product.objectPosition }} /></button>; })}</div>
            <button className="grid size-11 place-items-center border border-foreground/15 text-foreground/55 enabled:cursor-pointer enabled:hover:border-brand enabled:hover:text-brand disabled:opacity-20" type="button" onClick={() => setThumbnailStart((start) => Math.min(images.length - 4, start + 1))} disabled={thumbnailStart >= images.length - 4} aria-label={t.nextThumbs}><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="flex flex-col gap-7 lg:sticky lg:top-28">
          <div className="flex flex-col gap-4 border-b border-foreground/15 pb-7">
            <div className="flex items-center justify-between gap-5"><span className="text-[10px] font-black tracking-[.18em] text-brand uppercase">{t.product}</span>{product.sku && <span className="text-[9px] text-foreground/35 uppercase">SKU {product.sku}</span>}</div>
            <div className="flex flex-col gap-2"><h1 className="font-display text-[clamp(48px,6vw,78px)] leading-[.88] font-bold tracking-[-.04em] uppercase">{product.name}</h1><p className="text-xs font-bold tracking-[.08em] text-foreground/55 uppercase">{product.part}</p></div>
            <p className="max-w-2xl text-sm leading-6 text-foreground/60">{product.description ?? t.defaultDescription}</p>
            <div className="flex items-center justify-between gap-5 border-t border-foreground/12 pt-5"><strong className="text-3xl text-brand">{formatPrice(product.priceCents, locale === "es" ? "es-DO" : "en-US", product.currency)}</strong><p className={`flex items-center gap-2 text-[9px] font-black uppercase ${inStock ? "text-emerald-500" : "text-red-500"}`}><span className={`size-2 rounded-full ${inStock ? "bg-emerald-500" : "bg-red-500"}`} />{inStock ? t.stock : t.unavailable}</p></div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-black tracking-[.08em] uppercase">{t.quantity}</span>
            <div className="grid grid-cols-[145px_minmax(0,1fr)] gap-3 max-[520px]:grid-cols-1">
              <div className="grid h-13 grid-cols-3 border border-foreground/20"><button className="grid cursor-pointer place-items-center hover:text-brand" type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus size={16} /></button><span className="grid place-items-center border-x border-foreground/15 text-sm font-bold">{quantity}</span><button className="grid cursor-pointer place-items-center hover:text-brand" type="button" onClick={() => setQuantity((value) => Math.min(99, value + 1))} aria-label="Increase quantity"><Plus size={16} /></button></div>
              <button className="flex min-h-13 cursor-pointer items-center justify-between bg-brand px-5 text-[10px] font-black tracking-[.06em] text-black uppercase transition hover:bg-[#d99f00] disabled:cursor-not-allowed disabled:opacity-40" type="button" onClick={addToCart} disabled={!inStock}>{t.add}<ShoppingCart size={18} /></button>
            </div>
            <button className="flex min-h-13 cursor-pointer items-center justify-between border border-brand px-5 text-[10px] font-black tracking-[.06em] text-brand uppercase transition hover:bg-brand hover:text-black disabled:opacity-40" type="button" onClick={() => { addToCart(); router.push("/checkout"); }} disabled={!inStock}>{t.buy}<ArrowRight size={18} /></button>
          </div>

          <div className="grid grid-cols-2 gap-3"><button className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 border border-foreground/15 text-[10px] font-bold uppercase hover:border-brand hover:text-brand ${saved ? "text-brand" : ""}`} type="button" onClick={() => setSaved((value) => !value)}><Heart className={saved ? "fill-current" : ""} size={17} />{saved ? t.saved : t.save}</button><button className="flex min-h-12 cursor-pointer items-center justify-center gap-2 border border-foreground/15 text-[10px] font-bold uppercase hover:border-brand hover:text-brand" type="button" onClick={share}><Share2 size={17} />{t.share}</button></div>

          <div className="flex flex-col border-y border-foreground/15">{[
            [t.compatibility, product.compatibility ?? t.defaultCompatibility],
            [t.shipping, t.shippingCopy],
          ].map(([title, body]) => <details className="group border-b border-foreground/12 last:border-b-0" key={title}><summary className="flex min-h-13 cursor-pointer list-none items-center justify-between gap-4 text-[10px] font-black tracking-[.06em] uppercase"><span>{title}</span><Plus className="transition group-open:rotate-45" size={16} /></summary><p className="pb-5 text-xs leading-6 text-foreground/55">{body}</p></details>)}</div>

          <div className="grid grid-cols-3 gap-3 border border-foreground/12 bg-panel p-4 max-[520px]:grid-cols-1">{[[ShieldCheck, t.secure], [Check, t.support], [Truck, t.delivery]].map(([Icon, label]) => { const FeatureIcon = Icon as typeof ShieldCheck; return <div className="flex items-center gap-2 text-[9px] font-bold text-foreground/55 uppercase" key={String(label)}><FeatureIcon className="shrink-0 text-brand" size={17} /><span>{String(label)}</span></div>; })}</div>
        </div>
      </section>

      {relatedProducts.length > 0 && <section className="flex flex-col gap-6 border-t border-foreground/12 pt-12 max-[700px]:pt-9" aria-labelledby="related-products-title">
        <div className="flex items-end justify-between gap-6 max-[600px]:items-start"><div className="flex flex-col gap-2"><p className="text-[10px] font-black tracking-[.16em] text-brand uppercase">{t.relatedKicker}</p><h2 className="font-display text-[clamp(40px,5vw,64px)] leading-none font-bold tracking-[-.035em] uppercase" id="related-products-title">{t.related}</h2></div><Link className="flex items-center gap-3 text-[9px] font-black text-brand uppercase max-[600px]:hidden" href="/#products">{t.allProducts}<ArrowRight size={16} /></Link></div>
        <div className="grid grid-cols-4 gap-4 max-[900px]:grid-cols-2 max-[520px]:gap-3">{relatedProducts.map((item) => <article className="group flex min-w-0 flex-col overflow-hidden border border-foreground/15 bg-panel" key={item.id}>
          <Link className="relative h-64 overflow-hidden max-[700px]:h-44" href={`/products/${item.slug}`} aria-label={`${t.view}: ${item.name}`}><Image className="object-cover transition duration-500 group-hover:scale-[1.03]" src={item.image} alt={item.name} fill sizes="(max-width: 900px) 50vw, 25vw" style={{ objectPosition: item.objectPosition }} /></Link>
          <div className="flex flex-1 flex-col justify-between gap-5 p-4 max-[520px]:p-3"><div className="flex min-w-0 flex-col gap-1"><Link className="font-display truncate text-xl font-bold uppercase hover:text-brand max-[520px]:text-base" href={`/products/${item.slug}`}>{item.name}</Link><p className="truncate text-[9px] text-foreground/50 uppercase">{item.part}</p></div><div className="flex items-center justify-between gap-3"><strong className="text-base text-brand max-[520px]:text-sm">{formatPrice(item.priceCents, locale === "es" ? "es-DO" : "en-US", item.currency)}</strong><button className="grid size-10 shrink-0 cursor-pointer place-items-center bg-brand text-black transition hover:bg-[#d99f00]" type="button" onClick={() => addItem(item)} aria-label={`${t.add}: ${item.name}`}><ShoppingCart size={17} /></button></div></div>
        </article>)}</div>
      </section>}
    </div>

    <footer className="border-t border-foreground/12 bg-panel/45">
      <div className="mx-auto grid w-[min(1380px,calc(100%_-_56px))] grid-cols-[1.5fr_1fr_1fr_auto] gap-10 py-10 text-[10px] max-[800px]:w-[calc(100%_-_32px)] max-[800px]:grid-cols-2 max-[520px]:gap-8">
        <div className="flex flex-col gap-4 max-[800px]:col-span-2"><Link className="flex w-fit items-center gap-3" href="/"><Zap className="size-5 fill-brand text-brand" /><strong className="text-2xl font-black tracking-[-.05em] italic">BASEMENT</strong></Link><p className="max-w-xs leading-5 text-foreground/45">{t.footerMotto}</p></div>
        <div className="flex flex-col gap-3"><strong className="font-black uppercase">{t.footerShop}</strong><div className="flex flex-col gap-2 text-foreground/55"><Link className="hover:text-brand" href="/#products">{t.allProducts}</Link><Link className="hover:text-brand" href="/cart">Cart</Link><Link className="hover:text-brand" href="/account">Account</Link></div></div>
        <div className="flex flex-col gap-3"><strong className="font-black uppercase">{t.footerCompany}</strong><div className="flex flex-col gap-2 text-foreground/55"><Link className="hover:text-brand" href="/about">{t.about}</Link><Link className="hover:text-brand" href="/contact">{t.contact}</Link><Link className="hover:text-brand" href="/shipping">Shipping</Link><Link className="hover:text-brand" href="/returns">Returns</Link></div></div>
        <a className="grid size-10 place-items-center border border-foreground/20 hover:border-brand hover:text-brand max-[800px]:self-end" href="https://www.instagram.com/danielsperformanceparts/" target="_blank" rel="noreferrer" aria-label="Instagram"><Camera size={17} /></a>
        <div className="col-span-full flex items-center justify-between gap-6 border-t border-foreground/12 pt-5 text-[9px] text-foreground/40 max-[520px]:flex-col max-[520px]:items-start"><span>© 2026 Basement Performance Products.</span><span className="flex gap-5"><Link className="hover:text-brand" href="/terms">{t.terms}</Link><Link className="hover:text-brand" href="/privacy">{t.privacy}</Link></span></div>
      </div>
    </footer>
  </main>;
}
