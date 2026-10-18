"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { markQuoteStaffRead } from "@/app/manage/quotes/actions";
import { QuoteChatComposer } from "@/components/quotes/QuoteChatComposer";
import { QuoteChatThreadPane } from "@/components/quotes/QuoteChatThreadPane";
import { sendStaffReply } from "@/app/manage/quotes/actions";
import { quoteCopy, type QuoteLocale } from "@/lib/quotes/copy";
import { quoteMessageActionLabels } from "@/lib/quotes/message-action-labels";
import type { QuoteMessage } from "@/lib/quotes/message-types";
import { useQuoteRealtime } from "@/lib/quotes/use-quote-realtime";

export function AdminQuoteChatPanel({
  conversationId,
  locale,
  messages,
  layout = "full",
  redirectBase = "/manage/quotes",
}: {
  conversationId: string;
  locale: QuoteLocale;
  messages: QuoteMessage[];
  layout?: "full" | "compact";
  redirectBase?: string;
}) {
  const router = useRouter();
  const t = quoteCopy[locale];
  const actionLabels = useMemo(() => quoteMessageActionLabels(locale), [locale]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  useQuoteRealtime(conversationId, () => {
    router.refresh();
  });

  const lastMessageId = messages.at(-1)?.id ?? null;
  useEffect(() => {
    void markQuoteStaffRead(conversationId);
  }, [conversationId, lastMessageId, messages.length]);

  const placeholder = locale === "es" ? "Escribe un mensaje al cliente…" : "Write a message to the customer…";
  const sendLabel = locale === "es" ? "Enviar" : "Send";

  const editMessage = useCallback(
    async (messageId: string, body: string) => {
      if (editingMessageId || deletingMessageId) return;
      setEditingMessageId(messageId);
      setMutationError(null);
      try {
        const response = await fetch(`/api/quotes/${conversationId}/messages/${messageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(data.error ?? t.editMessageError);
        }
        router.refresh();
      } catch (error) {
        setMutationError(error instanceof Error ? error.message : t.editMessageError);
        throw error;
      } finally {
        setEditingMessageId(null);
      }
    },
    [conversationId, deletingMessageId, editingMessageId, router, t.editMessageError],
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (deletingMessageId || editingMessageId) return;
      setDeletingMessageId(messageId);
      setMutationError(null);
      try {
        const response = await fetch(`/api/quotes/${conversationId}/messages/${messageId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(data.error ?? t.deleteMessageError);
        }
        router.refresh();
      } catch (error) {
        setMutationError(error instanceof Error ? error.message : t.deleteMessageError);
        throw error;
      } finally {
        setDeletingMessageId(null);
      }
    },
    [conversationId, deletingMessageId, editingMessageId, router, t.deleteMessageError],
  );

  const composer = (
    <QuoteChatComposer
      mode="server"
      formAction={sendStaffReply}
      hiddenFields={{ conversation_id: conversationId, redirect_base: redirectBase }}
      placeholder={placeholder}
      sendLabel={sendLabel}
    />
  );

  const footer = (
    <div className="shrink-0 border-t border-foreground/10 bg-panel/55 px-3 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] lg:px-4 lg:py-3">
      {mutationError ? <p className="mb-2 px-1 text-xs text-red-400">{mutationError}</p> : null}
      {composer}
    </div>
  );

  const threadProps = {
    messages,
    locale,
    perspective: "staff" as const,
    actionLabels,
    editingMessageId,
    deletingMessageId,
    onEditMessage: editMessage,
    onDeleteMessage: deleteMessage,
  };

  if (layout === "full") {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <QuoteChatThreadPane
          className="quote-chat-scroll min-h-0 flex-1 overflow-y-auto bg-linear-to-b from-panel/30 to-ink px-3 py-4 lg:px-4"
          emptyLabel={locale === "es" ? "Sin mensajes todavía." : "No messages yet."}
          {...threadProps}
        />
        {footer}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <QuoteChatThreadPane
        className="quote-chat-scroll flex max-h-[min(52vh,420px)] flex-col overflow-y-auto rounded-xl bg-linear-to-b from-panel/50 to-ink/80 p-4"
        {...threadProps}
      />
      {mutationError ? <p className="text-xs text-red-400">{mutationError}</p> : null}
      {composer}
    </div>
  );
}
