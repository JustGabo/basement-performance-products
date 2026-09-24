"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { INSTANCE_LOADING_STATE, PayPalOneTimePaymentButton, PayPalProvider, usePayPal } from "@paypal/react-paypal-js/sdk-v6";
import { ArrowLeft, Check, ChevronDown, LockKeyhole, PackageCheck, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/cart/CartProvider";
import { BrandLogo } from "@/components/site/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { formatPrice } from "@/lib/commerce";

type Locale = "en" | "es";

export type CheckoutPrefill = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  stateRegion: string;
  postalCode: string;
  countryCode: string;
};

const copy = {
  en: {
    back: "Back to cart", kicker: "Secure checkout", title: "Finish your build.", contact: "Contact",
    delivery: "Delivery address", payment: "Payment", summary: "Order summary", email: "Email address",
    first: "First name", last: "Last name", phone: "Phone", address: "Street address", optional: "Apartment, suite, etc. (optional)",
    city: "City", region: "State / Province", postal: "ZIP / Postal code", country: "Country", us: "United States", dr: "Dominican Republic",
    shipping: "Shipping", free: "Complimentary during sandbox testing", total: "Total", empty: "Your cart is empty",
    emptyCopy: "Add the parts you want before continuing to checkout.", shop: "Return to products", sandbox: "PayPal sandbox",
    sandboxCopy: "No real money will be charged. Use a PayPal sandbox buyer account.", required: "Complete your delivery information to enable payment.",
    createError: "We could not create your PayPal order.", captureError: "Payment could not be completed.", processing: "Securing your order...",
    secure: "Encrypted PayPal checkout", inventory: "Inventory checked before payment", account: "Order saved to your account",
  },
  es: {
    back: "Volver al carrito", kicker: "Pago seguro", title: "Termina tu proyecto.", contact: "Contacto",
    delivery: "Dirección de entrega", payment: "Pago", summary: "Resumen del pedido", email: "Correo electrónico",
    first: "Nombre", last: "Apellido", phone: "Teléfono", address: "Dirección", optional: "Apartamento, unidad, etc. (opcional)",
    city: "Ciudad", region: "Estado / Provincia", postal: "Código postal", country: "País", us: "Estados Unidos", dr: "República Dominicana",
    shipping: "Envío", free: "Cortesía durante las pruebas sandbox", total: "Total", empty: "Tu carrito está vacío",
    emptyCopy: "Agrega las piezas que deseas antes de continuar al pago.", shop: "Volver a productos", sandbox: "Sandbox de PayPal",
    sandboxCopy: "No se cobrará dinero real. Usa una cuenta compradora de PayPal Sandbox.", required: "Completa la información de entrega para habilitar el pago.",
    createError: "No pudimos crear tu orden de PayPal.", captureError: "No se pudo completar el pago.", processing: "Asegurando tu orden...",
    secure: "Pago cifrado por PayPal", inventory: "Inventario validado antes del pago", account: "Orden guardada en tu cuenta",
  },
} as const;

const fieldClass = "h-12 w-full border border-foreground/18 bg-ink px-4 text-sm text-foreground outline-none transition placeholder:text-foreground/28 focus:border-brand focus:ring-3 focus:ring-brand/10";
const labelClass = "flex flex-col gap-2 text-[9px] font-black tracking-[.08em] text-foreground/70 uppercase";

type PayPalPaymentButtonProps = {
  disabled: boolean;
  createOrder: () => Promise<{ orderId: string }>;
  captureOrder: ({ orderId }: { orderId: string }) => Promise<void>;
  onCancel: () => void;
  onError: (error: unknown) => void;
};

function PayPalPaymentButton({ disabled, createOrder, captureOrder, onCancel, onError }: PayPalPaymentButtonProps) {
  const { loadingStatus, sdkInstance, error } = usePayPal();

  if (loadingStatus === INSTANCE_LOADING_STATE.PENDING) {
    return <div className="flex h-13 items-center justify-center border border-foreground/12 bg-ink text-[9px] font-black tracking-[.08em] text-foreground/45 uppercase"><span className="animate-pulse">Loading PayPal...</span></div>;
  }

  if (loadingStatus === INSTANCE_LOADING_STATE.REJECTED || !sdkInstance || error) {
    return <div className="border border-red-500/35 bg-red-500/8 p-4 text-xs leading-5 text-red-400" role="alert">{error?.message ?? "PayPal could not be initialized. Refresh the page and try again."}</div>;
  }

  return <div className={disabled ? "pointer-events-none opacity-45" : ""}><PayPalOneTimePaymentButton
    type="pay"
    disabled={disabled}
    createOrder={createOrder}
    onApprove={captureOrder}
    onCancel={onCancel}
    onError={onError}
  /></div>;
}

export function CheckoutClient({ clientId, environment, prefill }: { clientId: string; environment: "sandbox" | "production"; prefill: CheckoutPrefill }) {
  const router = useRouter();
  const { items, subtotalCents, hydrated, clearCart } = useCart();
  const [locale, setLocale] = useState<Locale>("en");
  const [form, setForm] = useState(prefill);
  const [processing, setProcessing] = useState(false);
  const t = copy[locale];

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const stored = window.localStorage.getItem("basement-locale");
      if (stored === "en" || stored === "es") setLocale(stored);
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  const complete = useMemo(() => Boolean(
    form.firstName.trim() && form.lastName.trim() && form.phone.trim() && form.line1.trim()
    && form.city.trim() && form.countryCode.trim().length === 2,
  ), [form]);
  const disabled = !hydrated || !items.length || !complete || processing || !clientId;

  const update = (key: keyof CheckoutPrefill, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const createOrder = async () => {
    setProcessing(true);
    try {
      const response = await fetch("/api/paypal/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
          shipping: form,
        }),
      });
      const data = await response.json() as { orderId?: string; error?: string };
      if (!response.ok || !data.orderId) throw new Error(data.error ?? t.createError);
      return { orderId: data.orderId };
    } finally {
      setProcessing(false);
    }
  };

  const captureOrder = async ({ orderId }: { orderId: string }) => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/paypal/orders/${encodeURIComponent(orderId)}/capture`, { method: "POST" });
      const data = await response.json() as { orderId?: string; error?: string };
      if (!response.ok || !data.orderId) throw new Error(data.error ?? t.captureError);
      clearCart();
      router.push(`/checkout/success?order=${encodeURIComponent(data.orderId)}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : t.captureError;
      toast.error(message);
      router.push(`/checkout/error?message=${encodeURIComponent(message)}`);
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  return <main className="min-h-svh bg-ink text-foreground transition-colors">
    <header className="sticky top-0 z-40 border-b border-foreground/12 bg-ink/90 backdrop-blur-xl">
      <div className="mx-auto grid h-20 w-[min(1480px,calc(100%_-_56px))] grid-cols-[1fr_auto_1fr] items-center gap-6 max-[700px]:h-16 max-[700px]:w-[calc(100%_-_32px)]">
        <Link className="flex w-fit items-center gap-2 text-[9px] font-black tracking-[.08em] text-foreground/55 uppercase hover:text-brand" href="/cart"><ArrowLeft size={16} /><span className="max-[520px]:hidden">{t.back}</span></Link>
        <BrandLogo compact />
        <div className="flex items-center justify-self-end gap-3"><span className="text-[8px] font-black tracking-[.12em] text-brand uppercase max-[600px]:hidden">{environment}</span><ThemeToggle compact /></div>
      </div>
    </header>

    <div className="mx-auto flex w-[min(1280px,calc(100%_-_56px))] flex-col gap-9 py-12 max-[700px]:w-[calc(100%_-_32px)] max-[700px]:gap-7 max-[700px]:py-8">
      <div className="flex flex-col gap-3"><p className="text-[10px] font-black tracking-[.18em] text-brand uppercase">{t.kicker}</p><h1 className="font-display text-[clamp(48px,7vw,88px)] leading-[.88] font-bold tracking-[-.04em] uppercase">{t.title}</h1></div>

      {!hydrated ? <div className="h-120 animate-pulse border border-foreground/12 bg-panel" /> : items.length === 0 ? <section className="flex min-h-100 flex-col items-center justify-center gap-6 border border-dashed border-foreground/20 bg-panel px-6 text-center"><span className="grid size-16 place-items-center rounded-full border border-brand/40 text-brand"><ShoppingBag size={27} /></span><div className="flex flex-col gap-2"><h2 className="font-display text-3xl font-bold uppercase">{t.empty}</h2><p className="text-sm text-foreground/50">{t.emptyCopy}</p></div><Link className="bg-brand px-6 py-4 text-[10px] font-black text-black uppercase" href="/#products">{t.shop}</Link></section> : <div className="grid grid-cols-[minmax(0,1fr)_420px] items-start gap-8 max-[1000px]:grid-cols-1">
        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-5 border border-foreground/15 bg-panel p-6 max-[600px]:p-4">
            <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center border border-brand/35 text-brand">01</span><h2 className="font-display text-2xl font-bold uppercase">{t.contact}</h2></div><Check className="text-emerald-500" size={18} /></div>
            <label className={labelClass}>{t.email}<input className={`${fieldClass} cursor-not-allowed opacity-60`} value={form.email} disabled type="email" /></label>
          </section>

          <section className="flex flex-col gap-5 border border-foreground/15 bg-panel p-6 max-[600px]:p-4">
            <div className="flex items-center gap-3"><span className="grid size-9 place-items-center border border-brand/35 text-brand">02</span><h2 className="font-display text-2xl font-bold uppercase">{t.delivery}</h2></div>
            <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
              <label className={labelClass}>{t.first}<input className={fieldClass} value={form.firstName} onChange={(event) => update("firstName", event.target.value)} autoComplete="given-name" /></label>
              <label className={labelClass}>{t.last}<input className={fieldClass} value={form.lastName} onChange={(event) => update("lastName", event.target.value)} autoComplete="family-name" /></label>
              <label className={`${labelClass} col-span-full`}>{t.phone}<input className={fieldClass} value={form.phone} onChange={(event) => update("phone", event.target.value)} autoComplete="tel" type="tel" /></label>
              <label className={`${labelClass} col-span-full`}>{t.country}<span className="relative"><select className={`${fieldClass} appearance-none pr-10`} value={form.countryCode} onChange={(event) => update("countryCode", event.target.value)}><option value="US">{t.us}</option><option value="DO">{t.dr}</option></select><ChevronDown className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-foreground/45" size={16} /></span></label>
              <label className={`${labelClass} col-span-full`}>{t.address}<input className={fieldClass} value={form.line1} onChange={(event) => update("line1", event.target.value)} autoComplete="address-line1" /></label>
              <label className={`${labelClass} col-span-full`}>{t.optional}<input className={fieldClass} value={form.line2} onChange={(event) => update("line2", event.target.value)} autoComplete="address-line2" /></label>
              <label className={labelClass}>{t.city}<input className={fieldClass} value={form.city} onChange={(event) => update("city", event.target.value)} autoComplete="address-level2" /></label>
              <label className={labelClass}>{t.region}<input className={fieldClass} value={form.stateRegion} onChange={(event) => update("stateRegion", event.target.value)} autoComplete="address-level1" /></label>
              <label className={labelClass}>{t.postal}<input className={fieldClass} value={form.postalCode} onChange={(event) => update("postalCode", event.target.value)} autoComplete="postal-code" /></label>
            </div>
          </section>

          <section className="flex flex-col gap-5 border border-foreground/15 bg-panel p-6 max-[600px]:p-4">
            <div className="flex items-center gap-3"><span className="grid size-9 place-items-center border border-brand/35 text-brand">03</span><h2 className="font-display text-2xl font-bold uppercase">{t.payment}</h2></div>
            <div className="flex gap-3 border-l-2 border-brand bg-brand/8 p-4"><LockKeyhole className="shrink-0 text-brand" size={19} /><div className="flex flex-col gap-1"><strong className="text-[10px] font-black tracking-[.08em] uppercase">{t.sandbox}</strong><p className="text-xs leading-5 text-foreground/55">{t.sandboxCopy}</p></div></div>
            {!complete && <p className="text-xs text-brand">{t.required}</p>}
            {!clientId ? <p className="border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-400">NEXT_PUBLIC_PAYPAL_CLIENT_ID is missing.</p> : <PayPalProvider clientId={clientId} environment={environment} components={["paypal-payments"]} pageType="checkout" locale={locale === "es" ? "es-ES" : "en-US"}>
              <PayPalPaymentButton
                disabled={disabled}
                createOrder={createOrder}
                captureOrder={captureOrder}
                onCancel={() => router.push("/checkout/cancel")}
                onError={(error) => { const message = error instanceof Error ? error.message : t.createError; toast.error(message); }}
              />
            </PayPalProvider>}
            {processing && <p className="animate-pulse text-center text-[10px] font-black tracking-[.08em] text-brand uppercase">{t.processing}</p>}
          </section>

          <div className="grid grid-cols-3 gap-3 max-[650px]:grid-cols-1">{[[LockKeyhole, t.secure], [PackageCheck, t.inventory], [ShieldCheck, t.account]].map(([Icon, label]) => { const FeatureIcon = Icon as typeof LockKeyhole; return <div className="flex items-center gap-3 border border-foreground/12 p-3 text-[9px] font-bold text-foreground/55 uppercase" key={String(label)}><FeatureIcon className="shrink-0 text-brand" size={17} />{String(label)}</div>; })}</div>
        </div>

        <aside className="sticky top-24 flex flex-col gap-5 border border-foreground/15 bg-panel p-6 max-[1000px]:static max-[600px]:p-4">
          <div className="flex items-center justify-between gap-5"><h2 className="font-display text-3xl font-bold uppercase">{t.summary}</h2><span className="text-[10px] font-black text-brand">{String(items.reduce((total, item) => total + item.quantity, 0)).padStart(2, "0")}</span></div>
          <div className="flex max-h-85 flex-col gap-4 overflow-y-auto pr-1">{items.map(({ product, quantity }) => <article className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-3" key={product.id}><div className="relative h-18 overflow-hidden bg-ink"><Image className="object-cover" src={product.image} alt={product.name} fill sizes="72px" style={{ objectPosition: product.objectPosition }} /><span className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-brand text-[8px] font-black text-black">{quantity}</span></div><div className="min-w-0"><h3 className="font-display truncate text-base font-bold uppercase">{product.name}</h3><p className="truncate text-[8px] text-foreground/45 uppercase">{product.part}</p></div><strong className="text-xs">{formatPrice(product.priceCents * quantity)}</strong></article>)}</div>
          <div className="flex flex-col gap-3 border-t border-foreground/12 pt-5 text-xs"><div className="flex justify-between gap-5 text-foreground/60"><span>Subtotal</span><strong className="text-foreground">{formatPrice(subtotalCents)}</strong></div><div className="flex justify-between gap-5 text-foreground/60"><span>{t.shipping}</span><span className="max-w-50 text-right text-[10px] text-brand">{t.free}</span></div><div className="flex items-end justify-between gap-5 border-t border-foreground/12 pt-4"><strong className="font-display text-2xl uppercase">{t.total}</strong><strong className="text-2xl text-brand">{formatPrice(subtotalCents)}</strong></div></div>
          <div className="flex items-center gap-3 border-t border-foreground/12 pt-4 text-[9px] text-foreground/45"><Truck className="text-brand" size={17} />USD · PayPal Sandbox</div>
        </aside>
      </div>}
    </div>
  </main>;
}
