"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { QuoteChatComposer } from "@/components/quotes/QuoteChatComposer";
import { QuoteChatThreadPane } from "@/components/quotes/QuoteChatThreadPane";
import { QuoteIntakeFields } from "@/components/quotes/quote-form-fields";
import { quoteCopy, type QuoteLocale } from "@/lib/quotes/copy";
import type { QuoteMessage } from "@/lib/quotes/message-types";
import {
  buildOptimisticCustomerMessage,
  mergeQuoteMessagesWithOutbox,
  PENDING_MESSAGE_ID_PREFIX,
} from "@/lib/quotes/optimistic-messages";
import { quoteMessageActionLabels } from "@/lib/quotes/message-action-labels";
import { useQuoteRealtime } from "@/lib/quotes/use-quote-realtime";

type ConversationMeta = {
  id: string;
  status: string;
  productName: string;
  locale: string;
};

const POLL_MS = 120_000;

export function QuoteChat({
  conversationId,
  accessToken,
  locale,
  layout = "compact",
  onConversationMeta,
}: {
  conversationId: string;
  accessToken: string;
  locale: QuoteLocale;
  layout?: "compact" | "full";
  onConversationMeta?: (meta: ConversationMeta) => void;
}) {
  const compact = layout === "compact";
  const t = quoteCopy[locale];
  const [messages, setMessages] = useState<QuoteMessage[]>([]);
  const [status, setStatus] = useState<string>("collecting");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [messageOutbox, setMessageOutbox] = useState<QuoteMessage[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const actionLabels = useMemo(() => quoteMessageActionLabels(locale), [locale]);
  const [intake, setIntake] = useState({
    country: "",
    city: "",
    postalCode: "",
    quantity: "1",
    phone: "",
    notes: "",
  });
  const intakeInFlightRef = useRef(false);
  const messageInFlightRef = useRef(false);

  const showIntakeForm = status === "collecting";
  const canSendMessages = status !== "collecting" && status !== "closed";
  const threadMessages = useMemo(
    () => mergeQuoteMessagesWithOutbox(messages, messageOutbox),
    [messageOutbox, messages],
  );

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/quotes/${conversationId}?token=${encodeURIComponent(accessToken)}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(t.pollError);
    }
    const data = (await response.json()) as {
      conversation: ConversationMeta;
      messages: QuoteMessage[];
    };
    setMessages(data.messages);
    setStatus(data.conversation.status);
    onConversationMeta?.(data.conversation);
  }, [accessToken, conversationId, onConversationMeta, t.pollError]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch (refreshError) {
        if (!cancelled) {
          setError(refreshError instanceof Error ? refreshError.message : t.pollError);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh, t.pollError]);

  useQuoteRealtime(conversationId, () => {
    void refresh().catch(() => undefined);
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      void refresh().catch(() => undefined);
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refresh().catch(() => undefined);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const submitIntake = async (event: React.FormEvent) => {
    event.preventDefault();
    if (intakeInFlightRef.current || submitting) return;
    intakeInFlightRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/quotes/${conversationId}/intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: accessToken,
          country: intake.country,
          city: intake.city,
          postalCode: intake.postalCode,
          quantity: Number(intake.quantity),
          phone: intake.phone,
          notes: intake.notes,
        }),
      });
      const data = (await response.json()) as { error?: string; messages?: QuoteMessage[] };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not submit details.");
      }
      if (data.messages) setMessages(data.messages);
      setStatus("reviewing");
      await refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit details.");
    } finally {
      intakeInFlightRef.current = false;
      setSubmitting(false);
    }
  };

  const editMessage = useCallback(
    async (messageId: string, body: string) => {
      if (messageId.startsWith(PENDING_MESSAGE_ID_PREFIX) || editingMessageId || deletingMessageId) return;
      setEditingMessageId(messageId);
      setError(null);
      try {
        const response = await fetch(`/api/quotes/${conversationId}/messages/${messageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: accessToken, body }),
        });
        const data = (await response.json()) as { error?: string; messages?: QuoteMessage[] };
        if (!response.ok) {
          throw new Error(data.error ?? t.editMessageError);
        }
        if (data.messages) setMessages(data.messages);
        else await refresh();
      } catch (editError) {
        setError(editError instanceof Error ? editError.message : t.editMessageError);
        throw editError;
      } finally {
        setEditingMessageId(null);
      }
    },
    [accessToken, conversationId, deletingMessageId, editingMessageId, refresh, t.editMessageError],
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (messageId.startsWith(PENDING_MESSAGE_ID_PREFIX) || deletingMessageId || editingMessageId) return;
      setDeletingMessageId(messageId);
      setError(null);
      try {
        const response = await fetch(`/api/quotes/${conversationId}/messages/${messageId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: accessToken }),
        });
        const data = (await response.json()) as { error?: string; messages?: QuoteMessage[] };
        if (!response.ok) {
          throw new Error(data.error ?? t.deleteMessageError);
        }
        if (data.messages) setMessages(data.messages);
        else await refresh();
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : t.deleteMessageError);
        throw deleteError;
      } finally {
        setDeletingMessageId(null);
      }
    },
    [accessToken, conversationId, deletingMessageId, editingMessageId, refresh, t.deleteMessageError],
  );

  const submitMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const body = draftMessage.trim();
    if (!body || !canSendMessages || messageInFlightRef.current || sendingMessage) return;

    const clientMessageId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const optimistic = buildOptimisticCustomerMessage(body, clientMessageId);

    messageInFlightRef.current = true;
    setSendingMessage(true);
    setError(null);
    setDraftMessage("");
    setMessageOutbox((current) => [...current, optimistic]);

    try {
      const response = await fetch(`/api/quotes/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: accessToken, body, clientMessageId }),
      });
      const data = (await response.json()) as { error?: string; messages?: QuoteMessage[] };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not send message.");
      }
      if (data.messages) setMessages(data.messages);
      else await refresh();
      setMessageOutbox((current) => current.filter((message) => message.id !== optimistic.id));
    } catch (sendError) {
      setMessageOutbox((current) => current.filter((message) => message.id !== optimistic.id));
      setDraftMessage(body);
      setError(sendError instanceof Error ? sendError.message : "Could not send message.");
    } finally {
      messageInFlightRef.current = false;
      setSendingMessage(false);
    }
  };

  const composer = showIntakeForm ? (
    <form className="quote-chat-scroll grid max-h-[min(50vh,420px)] gap-3 overflow-y-auto" onSubmit={submitIntake}>
      <fieldset className="contents" disabled={submitting}>
        <QuoteIntakeFields
          locale={locale}
          intake={intake}
          onChange={(patch) => setIntake((value) => ({ ...value, ...patch }))}
        />
      </fieldset>
      <button
        className="flex min-h-12 cursor-pointer items-center justify-center bg-brand text-[10px] font-black text-black uppercase disabled:opacity-50"
        type="submit"
        disabled={submitting}
      >
        {submitting ? t.sending : t.submitIntake}
      </button>
    </form>
  ) : canSendMessages ? (
    <QuoteChatComposer
      value={draftMessage}
      onChange={setDraftMessage}
      onSubmit={submitMessage}
      sending={sendingMessage}
      placeholder={t.messagePlaceholder}
      sendLabel={t.sendMessage}
      sendingLabel={t.sending}
    />
  ) : (
    <p className="text-xs text-foreground/45">
      {locale === "es" ? "Esta conversación está cerrada." : "This conversation is closed."}
    </p>
  );

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center ${compact ? "min-h-48" : "min-h-0 flex-1"}`}
      >
        <Loader2 className="animate-spin text-brand" size={24} />
      </div>
    );
  }

  if (layout === "full") {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <QuoteChatThreadPane
          className="quote-chat-scroll min-h-0 flex-1 overflow-y-auto bg-linear-to-b from-panel/30 to-ink px-3 py-4 lg:px-4"
          messages={threadMessages}
          locale={locale}
          perspective="customer"
          emptyLabel={t.sending}
          actionLabels={actionLabels}
          editingMessageId={editingMessageId}
          deletingMessageId={deletingMessageId}
          onEditMessage={editMessage}
          onDeleteMessage={deleteMessage}
        />

        <div className="shrink-0 border-t border-foreground/10 bg-panel/55 px-3 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] lg:px-4 lg:py-3">
          {error && <p className="mb-2 px-1 text-xs text-red-400">{error}</p>}
          {composer}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <QuoteChatThreadPane
        className="quote-chat-scroll flex max-h-[min(52vh,420px)] flex-col gap-4 overflow-y-auto rounded-xl bg-linear-to-b from-panel/50 to-ink/80 p-4"
        messages={threadMessages}
        locale={locale}
        perspective="customer"
        emptyLabel={t.sending}
        actionLabels={actionLabels}
        editingMessageId={editingMessageId}
        deletingMessageId={deletingMessageId}
        onEditMessage={editMessage}
        onDeleteMessage={deleteMessage}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex flex-col gap-3">{composer}</div>
    </div>
  );
}
