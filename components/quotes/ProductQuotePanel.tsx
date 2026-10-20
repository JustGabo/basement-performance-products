"use client";

import { useRef, useState } from "react";
import { MessageSquare, Sparkles } from "lucide-react";
import Link from "next/link";
import type { StoreProduct } from "@/lib/commerce";
import { quoteCopy, type QuoteLocale } from "@/lib/quotes/copy";
import { QuoteChat } from "@/components/quotes/QuoteChat";
import { QuoteIntakeFields, quoteFieldClass, quoteLabelClass } from "@/components/quotes/quote-form-fields";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { saveQuoteSession } from "@/lib/quotes/client-sessions";
import {
  InternationalQuotePromo,
  internationalQuoteCtaClassName,
  internationalQuoteSecondaryCtaClassName,
} from "@/components/quotes/InternationalQuotePromo";

type RequestKind = "shipping" | "custom";

export function ProductQuotePanel({
  product,
  locale,
}: {
  product: StoreProduct;
  locale: QuoteLocale;
}) {
  const t = quoteCopy[locale];
  const [open, setOpen] = useState(false);
  const [requestKind, setRequestKind] = useState<RequestKind>("shipping");
  const [step, setStep] = useState<"intro" | "chat">("intro");
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
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const startInFlightRef = useRef(false);

  const openDialog = (kind: RequestKind) => {
    setRequestKind(kind);
    setStep("intro");
    setError(null);
    setOpen(true);
  };

  const dialogTitle = requestKind === "custom" ? t.dialogCustomTitle : t.dialogShippingTitle;
  const dialogDescription =
    requestKind === "custom" ? t.dialogCustomDescription : t.dialogShippingDescription;

  const startChat = async (event: React.FormEvent) => {
    event.preventDefault();
    if (startInFlightRef.current || starting) return;
    startInFlightRef.current = true;
    setStarting(true);
    setError(null);
    try {
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
      setConversationId(data.conversationId);
      setAccessToken(data.accessToken);
      setStep("chat");
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "Could not start quote chat.");
    } finally {
      startInFlightRef.current = false;
      setStarting(false);
    }
  };

  return (
    <InternationalQuotePromo locale={locale}>
      <div className="grid gap-2">
        <button
          className={internationalQuoteCtaClassName()}
          type="button"
          onClick={() => openDialog("shipping")}
        >
          <MessageSquare size={16} />
          {t.shippingQuoteCta}
        </button>
        <button
          className={internationalQuoteSecondaryCtaClassName()}
          type="button"
          onClick={() => openDialog("custom")}
        >
          <Sparkles size={16} />
          {t.customOrderCta}
        </button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setStep("intro");
        }}
      >
        <DialogContent
          className={`max-h-[90svh] gap-0 overflow-x-hidden overflow-y-auto border-foreground/15 bg-panel p-0 text-foreground ${step === "chat" ? "sm:max-w-xl" : "sm:max-w-lg"}`}
        >
          <DialogHeader className="gap-1 border-b border-foreground/12 p-5 text-left">
            <DialogTitle className="font-display text-2xl font-bold uppercase leading-tight">
              {step === "chat" ? product.name : dialogTitle}
            </DialogTitle>
            <DialogDescription className="text-xs text-foreground/55">
              {step === "chat"
                ? requestKind === "custom"
                  ? locale === "es"
                    ? "Pedido personalizado"
                    : "Custom order"
                  : locale === "es"
                    ? "Cotización internacional"
                    : "International quote"
                : dialogDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="min-w-0 overflow-x-hidden p-5">
            {step === "intro" ? (
              <form className="flex min-w-0 flex-col gap-4 overflow-x-hidden" onSubmit={startChat}>
                <p className="text-[10px] font-black tracking-[.12em] text-brand uppercase">{t.contactSection}</p>
                <label className={quoteLabelClass}>
                  {t.email}
                  <input
                    className={quoteFieldClass}
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </label>
                <label className={quoteLabelClass}>
                  {t.fullName}
                  <input
                    className={quoteFieldClass}
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                  />
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
              </form>
            ) : conversationId && accessToken ? (
              <div className="flex flex-col gap-3">
                <QuoteChat conversationId={conversationId} accessToken={accessToken} locale={locale} layout="compact" />
                <Link
                  className="text-[10px] font-bold text-brand uppercase underline underline-offset-4"
                  href={`/quotes/${conversationId}?token=${encodeURIComponent(accessToken)}${locale === "es" ? "&lang=es" : ""}`}
                >
                  {locale === "es" ? "Abrir en página completa" : "Open full page"}
                </Link>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </InternationalQuotePromo>
  );
}
