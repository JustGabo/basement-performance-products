"use client";

import { useEffect, useRef } from "react";
import { QuoteMessageThread, type QuoteThreadPerspective } from "@/components/quotes/QuoteMessageThread";
import type { QuoteLocale } from "@/lib/quotes/copy";
import type { QuoteMessage } from "@/lib/quotes/message-types";

export function QuoteChatThreadPane({
  messages,
  locale,
  perspective,
  emptyLabel,
  className,
}: {
  messages: QuoteMessage[];
  locale: QuoteLocale;
  perspective: QuoteThreadPerspective;
  emptyLabel?: string;
  className?: string;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessageId = messages.at(-1)?.id ?? null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lastMessageId, messages.length]);

  return (
    <div className={className}>
      <QuoteMessageThread
        messages={messages}
        locale={locale}
        perspective={perspective}
        emptyLabel={emptyLabel}
      />
      <div ref={bottomRef} aria-hidden className="h-px w-full shrink-0 scroll-mt-4" />
    </div>
  );
}
