"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "./CartProvider";
import { formatCartPrice, formatProductPrice } from "@/lib/commerce";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Locale = "en" | "es";

const copy = {
  en: { title: "Your cart", description: "Review the parts selected for your build.", empty: "Your cart is empty.", emptyCopy: "Add a product to start your next build.", total: "Total", note: "Taxes and shipping calculated at checkout.", view: "View cart", checkout: "Checkout", remove: "Remove", decrease: "Decrease quantity", increase: "Increase quantity", trigger: "Open shopping cart" },
  es: { title: "Tu carrito", description: "Revisa las piezas seleccionadas para tu proyecto.", empty: "Tu carrito está vacío.", emptyCopy: "Agrega un producto para comenzar tu próximo proyecto.", total: "Total", note: "Impuestos y envío calculados al pagar.", view: "Ver carrito", checkout: "Pagar", remove: "Eliminar", decrease: "Disminuir cantidad", increase: "Aumentar cantidad", trigger: "Abrir carrito" },
} as const;

export function CartDrawer({ locale = "en", className = "" }: { locale?: Locale; className?: string }) {
  const { items, totalItems, hydrated, updateQuantity, removeItem } = useCart();
  const t = copy[locale];

  return <Sheet>
    <Tooltip>
      <TooltipTrigger asChild><SheetTrigger className={`relative grid cursor-pointer place-items-center border-0 bg-transparent p-1 ${className}`} aria-label={`${t.trigger}: ${totalItems}`}>
        <ShoppingCart size={21} /><span className="absolute -top-1 -right-1 grid min-w-4 place-items-center text-[8px] font-black text-brand">{totalItems}</span>
      </SheetTrigger></TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>{t.trigger}</TooltipContent>
    </Tooltip>

    <SheetContent className="w-full gap-0 border-foreground/15 bg-ink p-0 text-foreground sm:max-w-[500px]" side="right">
      <SheetHeader className="gap-2 border-b border-foreground/12 px-6 py-6 text-left max-[520px]:px-4">
        <div className="flex items-end justify-between gap-6 pr-8"><div className="flex flex-col gap-1"><span className="text-[9px] font-black tracking-[.16em] text-brand uppercase">Your garage</span><SheetTitle className="font-display text-4xl font-bold tracking-[-.03em] text-foreground uppercase">{t.title}</SheetTitle></div><span className="text-xs font-black text-brand">{String(totalItems).padStart(2, "0")}</span></div>
        <SheetDescription className="text-xs text-foreground/45">{t.description}</SheetDescription>
      </SheetHeader>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 max-[520px]:px-4">
        {!hydrated ? <div className="h-32 animate-pulse border border-foreground/10 bg-panel" /> : items.length === 0 ? <div className="flex h-full min-h-80 flex-col items-center justify-center gap-5 text-center"><span className="grid size-15 place-items-center rounded-full border border-brand/35 text-brand"><ShoppingBag size={25} /></span><div className="flex flex-col gap-2"><strong className="font-display text-2xl uppercase">{t.empty}</strong><p className="text-xs text-foreground/45">{t.emptyCopy}</p></div></div> : <div className="flex flex-col gap-3">{items.map(({ product, quantity }) => <article className="grid grid-cols-[92px_minmax(0,1fr)] gap-4 border-b border-foreground/12 pb-4" key={product.id}>
          <Link className="relative h-24 overflow-hidden bg-panel" href={`/products/${product.slug}`}><Image className="object-cover" src={product.image} alt={product.name} fill sizes="92px" style={{ objectPosition: product.objectPosition }} /></Link>
          <div className="flex min-w-0 flex-col justify-between gap-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><Link className="font-display block truncate text-lg font-bold uppercase hover:text-brand" href={`/products/${product.slug}`}>{product.name}</Link><p className="truncate text-[8px] text-foreground/45 uppercase">{product.part}</p></div><button className="cursor-pointer text-foreground/35 hover:text-red-500" type="button" onClick={() => removeItem(product.id)} aria-label={`${t.remove}: ${product.name}`}><Trash2 size={15} /></button></div><div className="flex items-center justify-between gap-4"><div className="flex items-center border border-foreground/15"><button className="grid size-7 cursor-pointer place-items-center hover:text-brand" type="button" onClick={() => updateQuantity(product.id, quantity - 1)} aria-label={`${t.decrease}: ${product.name}`}><Minus size={12} /></button><span className="grid h-7 min-w-7 place-items-center border-x border-foreground/15 text-[10px] font-bold">{quantity}</span><button className="grid size-7 cursor-pointer place-items-center hover:text-brand" type="button" onClick={() => updateQuantity(product.id, quantity + 1)} aria-label={`${t.increase}: ${product.name}`}><Plus size={12} /></button></div><strong className="text-sm text-brand">{formatProductPrice(product, quantity, locale === "es" ? "es-DO" : "en-US")}</strong></div></div>
        </article>)}</div>}
      </div>

      <SheetFooter className="gap-5 border-t border-foreground/12 bg-panel px-6 py-6 max-[520px]:px-4">
        <div className="flex flex-col gap-2"><div className="flex items-end justify-between gap-5"><strong className="font-display text-2xl font-bold uppercase">{t.total}</strong><strong className="text-xl text-brand">{formatCartPrice(items, locale === "es" ? "es-DO" : "en-US")}</strong></div><p className="text-[10px] text-foreground/45">{t.note}</p></div>
        <div className="grid grid-cols-2 gap-3 max-[420px]:grid-cols-1"><SheetClose asChild><Link className="flex min-h-13 items-center justify-center border border-brand text-[10px] font-black text-brand uppercase transition hover:bg-brand hover:text-black" href="/cart">{t.view}</Link></SheetClose><SheetClose asChild><Link className="flex min-h-13 items-center justify-between bg-brand px-5 text-[10px] font-black text-black uppercase transition hover:bg-[#d99f00]" href="/checkout">{t.checkout}<ArrowRight size={17} /></Link></SheetClose></div>
      </SheetFooter>
    </SheetContent>
  </Sheet>;
}
