import type { QuoteMessageActionLabels } from "@/components/quotes/QuoteMessageActions";
import { quoteCopy, type QuoteLocale } from "@/lib/quotes/copy";

export function quoteMessageActionLabels(locale: QuoteLocale): QuoteMessageActionLabels {
  const t = quoteCopy[locale];
  return {
    menu: t.messageMenuLabel,
    edit: t.editMessage,
    delete: t.deleteMessage,
    editTitle: t.editMessageTitle,
    deleteTitle: t.deleteMessageTitle,
    deleteConfirm: t.deleteMessageConfirm,
    cancel: t.cancel,
    apply: t.apply,
    saving: t.savingMessage,
    deleting: t.deletingMessage,
  };
}
