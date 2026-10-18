"use client";

import { useMemo, type ReactNode } from "react";
import { QuoteOfferCard } from "@/components/quotes/QuoteOfferCard";
import { QuoteIntakeSummary, type IntakePayload } from "@/components/quotes/QuoteIntakeSummary";
import {
  QuoteMessageActions,
  type QuoteMessageActionLabels,
} from "@/components/quotes/QuoteMessageActions";
import type { QuoteLocale } from "@/lib/quotes/copy";
import {
  canManageOwnQuoteMessage,
  dayKey,
  formatDayLabel,
  formatMessageTime,
  resolveIntakePayload,
  type QuoteMessage,
  type QuoteThreadPerspective,
} from "@/lib/quotes/message-types";
import { isPendingQuoteMessage } from "@/lib/quotes/optimistic-messages";

export type { QuoteThreadPerspective };

/**
 * Customer chat: right = customer. Left = Basement (bot) + team (staff).
 * Admin chat: right = Basement (bot) + our replies (staff). Left = customer only.
 */
function isOutgoing(role: QuoteMessage["role"], perspective: QuoteThreadPerspective) {
  if (perspective === "customer") return role === "customer";
  return role === "bot" || role === "staff";
}

function BubbleTime({ iso, locale }: { iso: string; locale: QuoteLocale }) {
  return (
    <span
      className="shrink-0 translate-y-0.5 text-[10px] leading-none text-foreground/35 tabular-nums"
      suppressHydrationWarning
    >
      {formatMessageTime(iso, locale)}
    </span>
  );
}

const outgoingShell = "rounded-2xl rounded-br-md border border-brand/30 bg-brand/18 text-foreground shadow-sm";
const incomingShell = "rounded-2xl rounded-bl-md border border-foreground/12 bg-panel/90 text-foreground/85 shadow-sm";

function IntakeBubble({
  payload,
  iso,
  locale,
  outgoing,
}: {
  payload: IntakePayload;
  iso: string;
  locale: QuoteLocale;
  outgoing: boolean;
}) {
  return (
    <div
      className={`max-w-[min(100%,28rem)] px-3.5 pb-2.5 pt-4 ${outgoing ? outgoingShell : incomingShell}`}
    >
      <QuoteIntakeSummary locale={locale} payload={payload} tone={outgoing ? "outgoing" : "incoming"} />
      <div className="mt-2 flex justify-end">
        <BubbleTime iso={iso} locale={locale} />
      </div>
    </div>
  );
}

function TextBubble({
  body,
  iso,
  locale,
  outgoing,
  pending,
}: {
  body: string;
  iso: string;
  locale: QuoteLocale;
  outgoing: boolean;
  pending?: boolean;
}) {
  return (
    <div
      className={`max-w-[min(100%,28rem)] px-3 py-2 ${outgoing ? outgoingShell : incomingShell} ${pending ? "opacity-75" : ""}`}
    >
      <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
        <span className="min-w-[calc(100%-3.5rem)] flex-1 whitespace-pre-wrap text-sm leading-6">{body}</span>
        {pending ? (
          <span className="shrink-0 text-[10px] font-semibold tracking-[.04em] text-foreground/45 uppercase">
            {locale === "es" ? "Enviando…" : "Sending…"}
          </span>
        ) : (
          <BubbleTime iso={iso} locale={locale} />
        )}
      </div>
    </div>
  );
}

export function QuoteMessageThread({
  messages,
  locale,
  perspective,
  emptyLabel,
  actionLabels,
  editingMessageId,
  deletingMessageId,
  onEditMessage,
  onDeleteMessage,
}: {
  messages: QuoteMessage[];
  locale: QuoteLocale;
  perspective: QuoteThreadPerspective;
  emptyLabel?: string;
  actionLabels?: QuoteMessageActionLabels;
  editingMessageId?: string | null;
  deletingMessageId?: string | null;
  onEditMessage?: (messageId: string, body: string) => void | Promise<void>;
  onDeleteMessage?: (messageId: string) => void | Promise<void>;
}) {
  const nodes = useMemo(() => {
    let lastDay = "";
    const list: ReactNode[] = [];
    const canMutate = Boolean(actionLabels && onEditMessage && onDeleteMessage);

    for (const message of messages) {
      const currentDay = dayKey(message.created_at);
      if (currentDay !== lastDay) {
        lastDay = currentDay;
        list.push(
          <div className="flex items-center gap-3 py-2" key={`day-${currentDay}-${message.id}`}>
            <span className="h-px flex-1 bg-foreground/10" />
            <span className="text-[10px] font-bold tracking-[.08em] text-foreground/40 uppercase">
              {formatDayLabel(message.created_at, locale)}
            </span>
            <span className="h-px flex-1 bg-foreground/10" />
          </div>,
        );
      }

      const outgoing = isOutgoing(message.role, perspective);
      const intakePayload = resolveIntakePayload(message);

      let bubble: ReactNode;
      if (message.message_type === "offer" && message.payload) {
        bubble = (
          <div className={`w-full max-w-md ${outgoing ? "ml-auto" : ""}`}>
            <QuoteOfferCard
              locale={locale}
              payload={message.payload as {
                productName: string;
                quantity: number;
                unitPriceCents: number;
                shippingCents: number;
                totalCents: number;
                currency: string;
                invoiceUrl: string;
              }}
            />
            <div className={`mt-1 flex ${outgoing ? "justify-end" : "justify-start"} px-1`}>
              <BubbleTime iso={message.created_at} locale={locale} />
            </div>
          </div>
        );
      } else if (intakePayload) {
        bubble = (
          <IntakeBubble
            payload={intakePayload}
            iso={message.created_at}
            locale={locale}
            outgoing={outgoing}
          />
        );
      } else {
        const pending = isPendingQuoteMessage(message);
        const manageable =
          canMutate && canManageOwnQuoteMessage(message, perspective, { pending });
        bubble = (
          <div
            className={`flex max-w-[min(100%,32rem)] items-center gap-0.5 ${outgoing ? "ml-auto flex-row-reverse" : "mr-auto"}`}
          >
            <TextBubble
              body={message.body}
              iso={message.created_at}
              locale={locale}
              outgoing={outgoing}
              pending={pending}
            />
            {manageable && actionLabels && onEditMessage && onDeleteMessage ? (
              <QuoteMessageActions
                messageId={message.id}
                body={message.body}
                labels={actionLabels}
                menuSide={outgoing ? "left" : "right"}
                editing={editingMessageId === message.id}
                deleting={deletingMessageId === message.id}
                disabled={
                  (editingMessageId !== null && editingMessageId !== message.id) ||
                  (deletingMessageId !== null && deletingMessageId !== message.id)
                }
                onEdit={onEditMessage}
                onDelete={onDeleteMessage}
              />
            ) : null}
          </div>
        );
      }

      list.push(
        <div className="w-full py-2" key={message.id}>
          <div
            className={
              message.message_type === "offer"
                ? `w-full max-w-md ${outgoing ? "ml-auto" : "mr-auto"}`
                : intakePayload
                  ? `w-fit max-w-[min(100%,28rem)] ${outgoing ? "ml-auto" : "mr-auto"}`
                  : "w-full"
            }
          >
            {bubble}
          </div>
        </div>,
      );
    }

    return list;
  }, [
    actionLabels,
    deletingMessageId,
    editingMessageId,
    locale,
    messages,
    onDeleteMessage,
    onEditMessage,
    perspective,
  ]);

  if (messages.length === 0) {
    return <p className="py-8 text-center text-xs text-foreground/45">{emptyLabel ?? "—"}</p>;
  }

  return <div className="flex flex-col">{nodes}</div>;
}
