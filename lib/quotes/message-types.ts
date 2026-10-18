import type { IntakePayload } from "@/components/quotes/QuoteIntakeSummary";

export type { IntakePayload };
import type { QuoteLocale } from "@/lib/quotes/copy";

export type QuoteMessage = {
  id: string;
  role: "bot" | "customer" | "staff";
  message_type: "text" | "offer" | "system";
  body: string;
  payload: Record<string, unknown> | null;
  created_at: string;
};

export type QuoteThreadPerspective = "customer" | "staff";

export function canManageOwnQuoteMessage(
  message: QuoteMessage,
  perspective: QuoteThreadPerspective,
  options?: { pending?: boolean },
) {
  if (options?.pending) return false;
  if (message.message_type !== "text") return false;
  if (perspective === "customer") return message.role === "customer";
  return message.role === "staff";
}

/** @deprecated use canManageOwnQuoteMessage */
export const canDeleteOwnQuoteMessage = canManageOwnQuoteMessage;

/** Stable across SSR and browser (Intl es-DO uses narrow spaces that differ in Node). */
export function formatMessageTime(iso: string, locale: QuoteLocale) {
  const date = new Date(iso);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const hour12 = hours % 12 || 12;
  if (locale === "es") {
    return `${hour12}:${minutes} ${hours < 12 ? "a. m." : "p. m."}`;
  }
  return `${hour12}:${minutes} ${hours < 12 ? "AM" : "PM"}`;
}

export function formatDayLabel(iso: string, locale: QuoteLocale) {
  const date = new Date(iso);
  const today = new Date();
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  if (sameDay) {
    return locale === "es" ? "Hoy" : "Today";
  }
  return new Intl.DateTimeFormat(locale === "es" ? "es-DO" : "en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function dayKey(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function isIntakePayload(payload: Record<string, unknown> | null): payload is IntakePayload {
  if (!payload) return false;
  if (payload.kind === "intake") return true;
  return "country" in payload || "postalCode" in payload || "postal_code" in payload;
}

export function normalizeIntakePayload(payload: Record<string, unknown>): IntakePayload {
  return {
    kind: "intake",
    country: (payload.country as string | null) ?? null,
    city: (payload.city as string | null) ?? null,
    region: (payload.region as string | null) ?? null,
    postalCode: (payload.postalCode as string | null) ?? (payload.postal_code as string | null) ?? null,
    quantity: typeof payload.quantity === "number" ? payload.quantity : null,
    name: (payload.name as string | null) ?? null,
    phone: (payload.phone as string | null) ?? null,
    notes: (payload.notes as string | null) ?? null,
  };
}

const intakeLineMatchers: { key: keyof IntakePayload; prefixes: string[] }[] = [
  { key: "country", prefixes: ["Country:", "País:"] },
  { key: "city", prefixes: ["City:", "Ciudad:"] },
  { key: "postalCode", prefixes: ["Postal code:", "Código postal:"] },
  { key: "quantity", prefixes: ["Quantity:", "Cantidad:"] },
  { key: "name", prefixes: ["Name:", "Nombre completo:", "Nombre:"] },
  { key: "phone", prefixes: ["Phone:", "Teléfono:"] },
  { key: "notes", prefixes: ["Notes:", "Notas:"] },
];

export function parseIntakeBody(body: string): IntakePayload | null {
  const lines = body.split("\n").map((line) => line.trim()).filter(Boolean);
  if (!lines.some((line) => line.startsWith("Country:") || line.startsWith("País:"))) {
    return null;
  }

  const draft: IntakePayload = { kind: "intake" };
  for (const line of lines) {
    for (const matcher of intakeLineMatchers) {
      const prefix = matcher.prefixes.find((entry) => line.startsWith(entry));
      if (!prefix) continue;
      const value = line.slice(prefix.length).trim();
      if (matcher.key === "quantity") {
        draft.quantity = Number(value) || null;
      } else if (matcher.key === "country") draft.country = value;
      else if (matcher.key === "city") draft.city = value;
      else if (matcher.key === "postalCode") draft.postalCode = value;
      else if (matcher.key === "name") draft.name = value;
      else if (matcher.key === "phone") draft.phone = value;
      else if (matcher.key === "notes") draft.notes = value;
    }
  }

  return draft.country && draft.city ? draft : null;
}

export function resolveIntakePayload(message: QuoteMessage): IntakePayload | null {
  if (message.message_type !== "system" || message.role !== "customer") {
    return null;
  }
  if (message.payload && isIntakePayload(message.payload)) {
    return normalizeIntakePayload(message.payload);
  }
  return parseIntakeBody(message.body);
}
