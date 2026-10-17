import "server-only";

import { Resend } from "resend";

function resendClient() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export function quoteEmailFrom() {
  return process.env.RESEND_FROM_EMAIL?.trim() || "Basement Quotes <onboarding@resend.dev>";
}

export async function sendQuoteReadyEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  const client = resendClient();
  if (!client) {
    console.warn("[email] RESEND_API_KEY is not set; skipped quote-ready email.");
    return { ok: false as const, skipped: true as const };
  }

  const { error } = await client.emails.send({
    from: quoteEmailFrom(),
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { ok: true as const, skipped: false as const };
}
