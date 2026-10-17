import type { QuoteLocale } from "@/lib/quotes/copy";
import { quoteCopy } from "@/lib/quotes/copy";

export const quoteFieldClass =
  "min-h-11 w-full min-w-0 max-w-full border border-foreground/20 bg-ink px-3 text-sm normal-case outline-none transition focus:border-brand";
export const quoteLabelClass = "flex min-w-0 flex-col gap-1 text-[10px] font-bold uppercase";

export function QuoteIntakeFields({
  locale,
  intake,
  onChange,
}: {
  locale: QuoteLocale;
  intake: {
    country: string;
    city: string;
    postalCode: string;
    quantity: string;
    phone: string;
    notes: string;
  };
  onChange: (patch: Partial<typeof intake>) => void;
}) {
  const t = quoteCopy[locale];

  return (
    <>
      <p className="text-[10px] font-black tracking-[.12em] text-brand uppercase">{t.formTitle}</p>
      <div className="grid min-w-0 grid-cols-2 gap-3 max-[520px]:grid-cols-1">
        <label className={quoteLabelClass}>
          {t.country}
          <input
            className={quoteFieldClass}
            value={intake.country}
            onChange={(event) => onChange({ country: event.target.value })}
            placeholder={locale === "es" ? "México o MX" : "Mexico or MX"}
            required
          />
        </label>
        <label className={quoteLabelClass}>
          {t.city}
          <input
            className={quoteFieldClass}
            value={intake.city}
            onChange={(event) => onChange({ city: event.target.value })}
            required
          />
        </label>
        <label className={quoteLabelClass}>
          {t.postalCode}
          <input
            className={quoteFieldClass}
            value={intake.postalCode}
            onChange={(event) => onChange({ postalCode: event.target.value })}
            required
          />
        </label>
        <label className={quoteLabelClass}>
          {t.quantity}
          <input
            className={quoteFieldClass}
            type="number"
            min={1}
            max={99}
            value={intake.quantity}
            onChange={(event) => onChange({ quantity: event.target.value })}
            required
          />
        </label>
      </div>
      <label className={quoteLabelClass}>
        {t.phone}
        <input
          className={quoteFieldClass}
          value={intake.phone}
          onChange={(event) => onChange({ phone: event.target.value })}
        />
      </label>
      <label className={quoteLabelClass}>
        {t.notes}
        <textarea
          className={`${quoteFieldClass} min-h-20 py-2`}
          value={intake.notes}
          onChange={(event) => onChange({ notes: event.target.value })}
        />
      </label>
    </>
  );
}
