"use client";

import { useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { getMostRecentQuoteSession, saveQuoteSession } from "@/lib/quotes/client-sessions";
import {
  InternationalQuotePromo,
  internationalQuoteCtaClassName,
} from "@/components/quotes/InternationalQuotePromo";

export function ProductQuotePanel({
  product,
  locale,
}: {
  product: StoreProduct;
  locale: QuoteLocale;
}) {
  const t = quoteCopy[locale];
  const [open, setOpen] = useState(false);
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

  const startChat = async (event: React.FormEvent) => {
    event.preventDefault();
    if (startInFlightRef.current || starting) return;
    startInFlightRef.current = true;
    setStarting(true);
    setError(null);
    try {
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

  const resumeFromStorage = () => {
    const recent = getMostRecentQuoteSession();
    if (recent) {
      setConversationId(recent.id);
      setAccessToken(recent.token);
      setStep("chat");
      setOpen(true);
    }
  };

  return (
    <InternationalQuotePromo locale={locale}>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next && step === "intro") resumeFromStorage();
        }}
      >
        <DialogTrigger asChild>
          <button className={internationalQuoteCtaClassName()} type="button">
            <MessageSquare size={16} />
            {t.requestCta}
          </button>
        </DialogTrigger>
        <DialogContent
          className={`max-h-[90svh] gap-0 overflow-x-hidden overflow-y-auto border-foreground/15 bg-panel p-0 text-foreground ${step === "chat" ? "sm:max-w-xl" : "sm:max-w-lg"}`}
        >
          <DialogHeader className="gap-1 border-b border-foreground/12 p-5 text-left">
            <DialogTitle className="font-display text-2xl font-bold uppercase leading-tight">
              {step === "chat" ? product.name : t.internationalTitle}
            </DialogTitle>
            <DialogDescription className="text-xs text-foreground/55">
              {step === "chat"
                ? locale === "es"
                  ? "Cotización internacional"
                  : "International quote"
                : product.name}
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
                <QuoteIntakeFields
                  locale={locale}
                  intake={intake}
                  onChange={(patch) => setIntake((value) => ({ ...value, ...patch }))}
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  className="flex min-h-12 cursor-pointer items-center justify-center bg-brand text-[10px] font-black text-black uppercase disabled:opacity-50"
                  type="submit"
                  disabled={starting}
                >
                  {starting ? t.sending : t.submitRequest}
                </button>
              </form>
            ) : conversationId && accessToken ? (
              <div className="flex flex-col gap-3">
                <QuoteChat conversationId={conversationId} accessToken={accessToken} locale={locale} layout="compact" />
                <Link
                  className="text-[10px] font-bold text-brand uppercase underline underline-offset-4"
                  href={`/quotes/${conversationId}?token=${encodeURIComponent(accessToken)}`}
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
