"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { MessageSquare, Sparkles } from "lucide-react";
import type { CartItem } from "@/components/cart/CartProvider";
import { quoteCopy, type QuoteLocale } from "@/lib/quotes/copy";
import { QuoteIntakeFields, quoteFieldClass, quoteLabelClass } from "@/components/quotes/quote-form-fields";
import { saveQuoteSession } from "@/lib/quotes/client-sessions";
import {
  InternationalQuotePromo,
  internationalQuoteCtaClassName,
  internationalQuoteSecondaryCtaClassName,
} from "@/components/quotes/InternationalQuotePromo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type RequestKind = "shipping" | "custom";
type Locale = QuoteLocale;

export function CartQuoteRequest({ items, locale }: { items: CartItem[]; locale: Locale }) {
  const t = quoteCopy[locale];
  const [open, setOpen] = useState(false);
  const [requestKind, setRequestKind] = useState<RequestKind>("shipping");
  const [productId, setProductId] = useState(items[0]?.product.id ?? "");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [intake, setIntake] = useState({
    country: "",
    city: "",
    postalCode: "",
    quantity: String(items[0]?.quantity ?? 1),
    phone: "",
    notes: "",
  });
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startInFlightRef = useRef(false);

  const selected = items.find((item) => item.product.id === productId) ?? items[0];
  if (!selected) return null;

  const dialogTitle = requestKind === "custom" ? t.dialogCustomTitle : t.dialogShippingTitle;
  const dialogDescription =
    requestKind === "custom" ? t.dialogCustomDescription : t.dialogShippingDescription;

  const openDialog = (kind: RequestKind) => {
    setRequestKind(kind);
    setError(null);
    setOpen(true);
  };

  const startQuote = async (event: React.FormEvent) => {
    event.preventDefault();
    if (startInFlightRef.current || starting) return;
    startInFlightRef.current = true;
    setStarting(true);
    setError(null);
    try {
      const product = selected.product;
      const payload: Record<string, unknown> = {
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
        requestKind,
      };
      if (requestKind === "shipping") {
        payload.country = intake.country;
        payload.city = intake.city;
        payload.postalCode = intake.postalCode;
        payload.quantity = Number(intake.quantity);
        payload.phone = intake.phone;
        payload.notes = intake.notes;
      }
      const response = await fetch("/api/quotes/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      <div className="grid gap-2">
        <button
          className={internationalQuoteCtaClassName(true)}
          type="button"
          onClick={() => openDialog("shipping")}
        >
          <MessageSquare size={15} />
          {t.shippingQuoteCta}
        </button>
        <button
          className={internationalQuoteSecondaryCtaClassName(true)}
          type="button"
          onClick={() => openDialog("custom")}
        >
          <Sparkles size={15} />
          {t.customOrderCta}
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90svh] overflow-x-hidden overflow-y-auto border-foreground/15 bg-panel sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold uppercase">{dialogTitle}</DialogTitle>
            <DialogDescription className="text-xs text-foreground/55">{dialogDescription}</DialogDescription>
          </DialogHeader>
          <form className="flex min-w-0 flex-col gap-4 overflow-x-hidden" onSubmit={startQuote}>
            {items.length > 1 && requestKind === "shipping" ? (
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
            {requestKind === "shipping" ? (
              <QuoteIntakeFields
                locale={locale}
                intake={intake}
                onChange={(patch) => setIntake((value) => ({ ...value, ...patch }))}
              />
            ) : null}
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              className="flex min-h-12 cursor-pointer items-center justify-center bg-brand text-[10px] font-black text-black uppercase disabled:opacity-50"
              type="submit"
              disabled={starting}
            >
              {starting ? t.sending : requestKind === "shipping" ? t.submitRequest : t.openChat}
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
