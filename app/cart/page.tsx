"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { BrandLogo } from "@/components/site/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { formatCartPrice, formatProductPrice } from "@/lib/commerce";

type Locale = "en" | "es";

const copy = {
  en: {
    back: "Continue shopping", eyebrow: "Your garage", title: "Shopping cart", empty: "Your cart is empty.",
    emptyCopy: "Add the carbon fiber parts that will define your next build.", shop: "Shop products", remove: "Remove",
    decrease: "Decrease quantity", increase: "Increase quantity", subtotal: "Subtotal", shipping: "Shipping", calculated: "Calculated at checkout",
    total: "Estimated total", clear: "Clear cart", checkout: "Continue to checkout", secure: "Secure checkout and order history powered by your account.",
  },
  es: {
    back: "Seguir comprando", eyebrow: "Tu garaje", title: "Carrito", empty: "Tu carrito está vacío.",
    emptyCopy: "Agrega las piezas de fibra de carbono que definirán tu próximo proyecto.", shop: "Ver productos", remove: "Eliminar",
    decrease: "Disminuir cantidad", increase: "Aumentar cantidad", subtotal: "Subtotal", shipping: "Envío", calculated: "Calculado al pagar",
    total: "Total estimado", clear: "Vaciar carrito", checkout: "Continuar al pago", secure: "Pago seguro e historial de órdenes vinculados a tu cuenta.",
  },
} as const;

export default function CartPage() {
  const { items, hydrated, updateQuantity, removeItem, clearCart } = useCart();
  const [locale, setLocale] = useState<Locale>("en");
  const t = copy[locale];

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const stored = window.localStorage.getItem("basement-locale");
      if (stored === "en" || stored === "es") setLocale(stored);
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  return <main className="min-h-svh bg-ink text-foreground transition-colors">
    <header className="sticky top-0 z-30 border-b border-foreground/12 bg-ink/88 backdrop-blur-xl">
      <div className="mx-auto grid h-20 w-[min(1480px,calc(100%_-_56px))] grid-cols-[1fr_auto_1fr] items-center gap-6 max-[700px]:h-16 max-[700px]:w-[calc(100%_-_32px)]">
        <Link className="flex items-center gap-2 text-[10px] font-black tracking-[.08em] text-foreground/65 uppercase transition hover:text-brand" href="/#products"><ArrowLeft size={17} />{t.back}</Link>
        <BrandLogo compact />
        <div className="flex items-center justify-self-end gap-3"><span className="text-[10px] font-black text-brand">{items.reduce((total, item) => total + item.quantity, 0).toString().padStart(2, "0")}</span><ThemeToggle compact /></div>
      </div>
    </header>

    <section className="mx-auto flex w-[min(1280px,calc(100%_-_56px))] flex-col gap-10 py-14 max-[700px]:w-[calc(100%_-_32px)] max-[700px]:gap-7 max-[700px]:py-9">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black tracking-[.18em] text-brand uppercase">{t.eyebrow}</p>
        <h1 className="font-display text-[clamp(48px,7vw,92px)] leading-[.9] font-bold tracking-[-.04em] uppercase">{t.title}</h1>
      </div>

      {!hydrated ? <div className="h-72 animate-pulse rounded-sm border border-foreground/10 bg-foreground/3" /> : items.length === 0 ? <div className="flex min-h-90 flex-col items-center justify-center gap-6 rounded-sm border border-dashed border-foreground/20 bg-panel px-6 text-center">
        <span className="grid size-16 place-items-center rounded-full border border-brand/40 text-brand"><ShoppingBag size={27} /></span>
        <div className="flex flex-col gap-2"><h2 className="font-display text-3xl font-bold uppercase">{t.empty}</h2><p className="max-w-md text-sm leading-6 text-foreground/55">{t.emptyCopy}</p></div>
        <Link className="flex min-h-12 items-center gap-5 border border-brand bg-brand px-6 text-[10px] font-black text-black uppercase" href="/#products">{t.shop}<ArrowRight size={17} /></Link>
      </div> : <div className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-8 max-[900px]:grid-cols-1">
        <div className="flex flex-col gap-3">
          {items.map(({ product, quantity }) => <article className="grid grid-cols-[180px_minmax(0,1fr)_auto] items-center gap-5 rounded-sm border border-foreground/15 bg-panel p-3 max-[700px]:grid-cols-[92px_minmax(0,1fr)] max-[700px]:gap-3" key={product.id}>
            <div className="relative h-32 overflow-hidden rounded-sm max-[700px]:h-25"><Image className="object-cover" src={product.image} alt={product.name} fill sizes="(max-width: 700px) 92px, 180px" style={{ objectPosition: product.objectPosition }} /></div>
            <div className="flex min-w-0 flex-col gap-4 max-[700px]:gap-3">
              <div className="flex flex-col gap-1"><h2 className="font-display truncate text-2xl font-bold uppercase max-[700px]:text-lg">{product.name}</h2><p className="truncate text-[10px] uppercase text-foreground/50 max-[700px]:text-[8px]">{product.part}</p></div>
              <div className="flex w-fit items-center border border-foreground/20">
                <button className="grid size-8 cursor-pointer place-items-center text-foreground/65 hover:text-brand" type="button" aria-label={`${t.decrease}: ${product.name}`} onClick={() => updateQuantity(product.id, quantity - 1)}><Minus size={14} /></button>
                <span className="grid h-8 min-w-9 place-items-center border-x border-foreground/20 text-xs font-bold">{quantity}</span>
                <button className="grid size-8 cursor-pointer place-items-center text-foreground/65 hover:text-brand" type="button" aria-label={`${t.increase}: ${product.name}`} onClick={() => updateQuantity(product.id, quantity + 1)}><Plus size={14} /></button>
              </div>
            </div>
            <div className="flex h-full flex-col items-end justify-between gap-4 max-[700px]:col-span-2 max-[700px]:h-auto max-[700px]:flex-row-reverse max-[700px]:items-center">
              <button className="flex cursor-pointer items-center gap-2 text-[9px] font-bold text-foreground/45 uppercase transition hover:text-brand" type="button" onClick={() => removeItem(product.id)}><Trash2 size={15} />{t.remove}</button>
              <strong className="text-lg">{formatProductPrice(product, quantity)}</strong>
            </div>
          </article>)}
          <button className="w-fit cursor-pointer text-[9px] font-bold tracking-[.08em] text-foreground/45 uppercase underline underline-offset-4 transition hover:text-brand" type="button" onClick={clearCart}>{t.clear}</button>
        </div>

        <aside className="sticky top-24 flex flex-col gap-6 rounded-sm border border-foreground/15 bg-panel p-6 max-[900px]:static">
          <div className="flex flex-col gap-4 text-xs"><div className="flex justify-between gap-5 text-foreground/65"><span>{t.subtotal}</span><strong className="text-foreground">{formatCartPrice(items)}</strong></div><div className="flex justify-between gap-5 text-foreground/65"><span>{t.shipping}</span><span className="text-right text-[10px] uppercase">{t.calculated}</span></div></div>
          <div className="flex items-end justify-between gap-5 border-t border-foreground/15 pt-5"><span className="font-display text-2xl font-bold uppercase">{t.total}</span><strong className="text-xl text-brand">{formatCartPrice(items)}</strong></div>
          <Link className="flex min-h-13 items-center justify-between bg-brand px-5 text-[10px] font-black tracking-[.06em] text-black uppercase transition hover:bg-[#d99f00]" href="/checkout">{t.checkout}<ArrowRight size={18} /></Link>
          <p className="flex gap-2 text-[10px] leading-4 text-foreground/45"><ShieldCheck className="shrink-0 text-brand" size={17} />{t.secure}</p>
        </aside>
      </div>}
    </section>
  </main>;
}
