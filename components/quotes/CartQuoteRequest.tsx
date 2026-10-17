"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import type { CartItem } from "@/components/cart/CartProvider";
import { quoteCopy, type QuoteLocale } from "@/lib/quotes/copy";
import { QuoteIntakeFields, quoteFieldClass, quoteLabelClass } from "@/components/quotes/quote-form-fields";
import { saveQuoteSession } from "@/lib/quotes/client-sessions";
import {
  InternationalQuotePromo,
  internationalQuoteCtaClassName,
} from "@/components/quotes/InternationalQuotePromo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CartQuoteRequest({ items, locale }: { items: CartItem[]; locale: Locale }) {
  const t = quoteCopy[locale];
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState(items[0]?.product.id ?? "");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [intake, setIntake] = useState({
    country: "",
    city: "",
    postalCode: "",
    quantity: "1",
    phone: "",
    notes: "",
  });
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startInFlightRef = useRef(false);

  const selected = items.find((item) => item.product.id === productId) ?? items[0];
  if (!selected) return null;

  const startQuote = async (event: React.FormEvent) => {
    event.preventDefault();
    if (startInFlightRef.current || starting) return;
    startInFlightRef.current = true;
    setStarting(true);
    setError(null);
    try {
      const product = selected.product;
      const response = await fetch("/api/quotes/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          productName: product.name,
          productPart: product.part,
          merchandiseId: product.merchandiseId,
          variantSku: product.sku,
          unitPriceCents: product.displayPriceCents ?? product.priceCents,
          currency: product.displayCurrency ?? product.currency,
          customerEmail: email,
          customerName: fullName,
          locale,
          country: intake.country,
          city: intake.city,
          postalCode: intake.postalCode,
          quantity: Number(intake.quantity),
          phone: intake.phone,
          notes: intake.notes,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        conversationId?: string;
        accessToken?: string;
      };
      if (!response.ok || !data.conversationId || !data.accessToken) {
        throw new Error(data.error ?? "Could not start quote chat.");
      }
      saveQuoteSession({
        id: data.conversationId,
        token: data.accessToken,
        productName: product.name,
        status: "reviewing",
        updatedAt: new Date().toISOString(),
      });
      window.location.href = `/quotes/${data.conversationId}?token=${encodeURIComponent(data.accessToken)}${locale === "es" ? "&lang=es" : ""}`;
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "Could not start quote chat.");
    } finally {
      startInFlightRef.current = false;
      setStarting(false);
    }
  };

  return (
    <InternationalQuotePromo compact locale={locale}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className={internationalQuoteCtaClassName(true)} type="button">
            <MessageSquare size={15} />
            {t.requestCta}
          </button>
        </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-x-hidden overflow-y-auto border-foreground/15 bg-panel sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold uppercase">{t.internationalTitle}</DialogTitle>
          <DialogDescription className="text-xs text-foreground/55">{t.internationalBody}</DialogDescription>
        </DialogHeader>
        <form className="flex min-w-0 flex-col gap-4 overflow-x-hidden" onSubmit={startQuote}>
          {items.length > 1 ? (
            <label className={quoteLabelClass}>
              {locale === "es" ? "Producto a cotizar" : "Product to quote"}
              <select
                className={quoteFieldClass}
                value={productId}
                onChange={(event) => {
                  setProductId(event.target.value);
                  const line = items.find((item) => item.product.id === event.target.value);
                  if (line) setIntake((value) => ({ ...value, quantity: String(line.quantity) }));
                }}
              >
                {items.map(({ product, quantity }) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({quantity}×)
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className={quoteLabelClass}>
            {t.email}
            <input className={quoteFieldClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className={quoteLabelClass}>
            {t.fullName}
            <input className={quoteFieldClass} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <QuoteIntakeFields locale={locale} intake={intake} onChange={(patch) => setIntake((value) => ({ ...value, ...patch }))} />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            className="flex min-h-12 cursor-pointer items-center justify-center bg-brand text-[10px] font-black text-black uppercase disabled:opacity-50"
            type="submit"
            disabled={starting}
          >
            {starting ? t.sending : t.submitRequest}
          </button>
          <p className="text-center text-[10px] text-foreground/40">
            {locale === "es" ? "También disponible en " : "Also available on "}
            <Link className="text-brand underline underline-offset-2" href={`/products/${selected.product.slug}`}>
              {locale === "es" ? "la ficha del producto" : "each product page"}
            </Link>
          </p>
        </form>
      </DialogContent>
      </Dialog>
    </InternationalQuotePromo>
  );
}

type Locale = QuoteLocale;
