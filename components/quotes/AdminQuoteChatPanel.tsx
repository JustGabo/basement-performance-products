"use client";

import { useRouter } from "next/navigation";
import { QuoteChatComposer } from "@/components/quotes/QuoteChatComposer";
import { QuoteMessageThread } from "@/components/quotes/QuoteMessageThread";
import { sendStaffReply } from "@/app/manage/quotes/actions";
import type { QuoteLocale } from "@/lib/quotes/copy";
import type { QuoteMessage } from "@/lib/quotes/message-types";
import { useQuoteRealtime } from "@/lib/quotes/use-quote-realtime";

export function AdminQuoteChatPanel({
  conversationId,
  locale,
  messages,
  layout = "full",
}: {
  conversationId: string;
  locale: QuoteLocale;
  messages: QuoteMessage[];
  layout?: "full" | "compact";
}) {
  const router = useRouter();
  useQuoteRealtime(conversationId, () => {
    router.refresh();
  });

  const placeholder = locale === "es" ? "Escribe un mensaje al cliente…" : "Write a message to the customer…";
  const sendLabel = locale === "es" ? "Enviar" : "Send";

  const composer = (
    <QuoteChatComposer
      mode="server"
      formAction={sendStaffReply}
      hiddenFields={{ conversation_id: conversationId }}
      placeholder={placeholder}
      sendLabel={sendLabel}
    />
  );

  const footer = (
    <div className="shrink-0 border-t border-foreground/10 bg-panel/55 px-3 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] lg:px-4 lg:py-3">
      {composer}
    </div>
  );

  if (layout === "full") {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="quote-chat-scroll min-h-0 flex-1 overflow-y-auto bg-linear-to-b from-panel/30 to-ink px-3 py-4 lg:px-4">
          <QuoteMessageThread
            messages={messages}
            locale={locale}
            perspective="staff"
            emptyLabel={locale === "es" ? "Sin mensajes todavía." : "No messages yet."}
          />
        </div>
        {footer}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="quote-chat-scroll flex max-h-[min(52vh,420px)] flex-col overflow-y-auto rounded-xl bg-linear-to-b from-panel/50 to-ink/80 p-4">
        <QuoteMessageThread messages={messages} locale={locale} perspective="staff" />
      </div>
      {composer}
    </div>
  );
}
