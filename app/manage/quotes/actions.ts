"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertQuoteStaffWriter, quoteStaffRedirectBase } from "@/lib/quotes/staff-access";
import { sendQuoteReadyEmail } from "@/lib/email/resend";
import { buildQuoteReadyEmail } from "@/lib/quotes/offer-email";
import type { QuoteLocale } from "@/lib/quotes/copy";
import { insertMessage, markStaffRead } from "@/lib/quotes/server";
import { createInternationalDraftOrder, hasShopifyAdminConfig } from "@/lib/shopify/admin";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

function destination(path: string, type: "saved" | "error", message: string) {
  return `${path}?${type}=${encodeURIComponent(message)}`;
}

export async function sendQuoteOffer(formData: FormData) {
  const admin = await assertQuoteStaffWriter();
  const redirectBase = quoteStaffRedirectBase(formData);
  const conversationId = String(formData.get("conversation_id") ?? "");
  const shippingDollars = Number(formData.get("shipping_dollars") ?? 0);
  const manualInvoiceUrl = String(formData.get("manual_invoice_url") ?? "").trim();
  const staffNote = String(formData.get("staff_note") ?? "").trim();

  if (!conversationId || !Number.isFinite(shippingDollars) || shippingDollars < 0) {
    redirect(destination(`${redirectBase}/${conversationId || ""}`, "error", "Invalid shipping amount."));
  }

  const shippingCents = Math.round(shippingDollars * 100);

  const { data: conversation, error } = await admin
    .from("quote_conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle();

  if (error || !conversation) {
    redirect(destination(`${redirectBase}/${conversationId}`, "error", error?.message ?? "Conversation not found."));
  }

  if (!conversation.country || !conversation.city || !conversation.postal_code) {
    redirect(destination(`${redirectBase}/${conversationId}`, "error", "Customer shipping details are incomplete."));
  }

  let invoiceUrl = manualInvoiceUrl;
  let draftOrderId: string | null = null;

  if (!invoiceUrl) {
    if (!hasShopifyAdminConfig()) {
      redirect(
        destination(
          `${redirectBase}/${conversationId}`,
          "error",
          "Add a manual Shopify invoice URL or configure Shopify Admin API credentials (token or client ID + secret).",
        ),
      );
    }
    if (!conversation.merchandise_id) {
      redirect(
        destination(
          `${redirectBase}/${conversationId}`,
          "error",
          "This product has no Shopify variant id for draft orders.",
        ),
      );
    }

    const [firstName, ...rest] = conversation.customer_name.split(" ");
    try {
      const draft = await createInternationalDraftOrder({
        email: conversation.customer_email,
        merchandiseId: conversation.merchandise_id,
        quantity: conversation.quantity,
        unitPriceCents: conversation.unit_price_cents ?? 0,
        shippingCents,
        currency: conversation.currency,
        shippingTitle: "International shipping",
        shippingAddress: {
          firstName: firstName || conversation.customer_name,
          lastName: rest.join(" ") || conversation.customer_name,
          country: conversation.country,
          city: conversation.city,
          province: conversation.region ?? "",
          zip: conversation.postal_code,
          phone: conversation.phone ?? "",
        },
      });
      invoiceUrl = draft.invoiceUrl;
      draftOrderId = draft.draftOrderId;
    } catch (draftError) {
      redirect(
        destination(
          `${redirectBase}/${conversationId}`,
          "error",
          draftError instanceof Error ? draftError.message : "Shopify draft order failed.",
        ),
      );
    }
  }

  const unitPriceCents = conversation.unit_price_cents ?? 0;
  const productTotal = unitPriceCents * conversation.quantity;
  const totalCents = productTotal + shippingCents;
  const locale = (conversation.locale === "es" ? "es" : "en") as QuoteLocale;

  const payload = {
    productName: conversation.product_name,
    quantity: conversation.quantity,
    unitPriceCents,
    shippingCents,
    totalCents,
    currency: conversation.currency,
    invoiceUrl,
  };

  await insertMessage({
    conversationId,
    role: "staff",
    messageType: "offer",
    body: locale === "es" ? "Tu cotización internacional está lista." : "Your international quote is ready.",
    payload,
  });

  if (staffNote) {
    await insertMessage({
      conversationId,
      role: "staff",
      messageType: "text",
      body: staffNote,
    });
  }

  const { error: updateError } = await admin
    .from("quote_conversations")
    .update({
      status: "quoted",
      offer_shipping_cents: shippingCents,
      invoice_url: invoiceUrl,
      shopify_draft_order_id: draftOrderId,
      offer_sent_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (updateError) {
    redirect(destination(`${redirectBase}/${conversationId}`, "error", updateError.message));
  }

  const chatUrl = `${siteUrl()}/quotes/${conversationId}?token=${conversation.access_token}`;
  const email = buildQuoteReadyEmail({
    locale,
    customerName: conversation.customer_name,
    productName: conversation.product_name,
    quantity: conversation.quantity,
    unitPriceCents,
    shippingCents,
    currency: conversation.currency,
    chatUrl,
    invoiceUrl,
  });

  let emailNotice = "Quote sent and email delivered.";
  try {
    const emailResult = await sendQuoteReadyEmail({
      to: conversation.customer_email,
      subject: email.subject,
      html: email.html,
    });
    if (emailResult.skipped) {
      emailNotice = "Quote sent in chat. Email skipped (RESEND_API_KEY not set).";
    }
  } catch (emailError) {
    redirect(
      destination(
        `/manage/quotes/${conversationId}`,
        "error",
        emailError instanceof Error ? emailError.message : "Offer saved but email failed.",
      ),
    );
  }

  revalidatePath("/manage/quotes");
  revalidatePath("/account/quotes");
  revalidatePath(`${redirectBase}/${conversationId}`);
  revalidatePath(`/manage/quotes/${conversationId}`);
  revalidatePath(`/quotes/${conversationId}`);
  redirect(destination(`${redirectBase}/${conversationId}`, "saved", emailNotice));
}

export async function sendStaffReply(formData: FormData) {
  const redirectBase = quoteStaffRedirectBase(formData);
  const conversationId = String(formData.get("conversation_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!conversationId || !body) {
    redirect(destination(`${redirectBase}/${conversationId || ""}`, "error", "Message is required."));
  }

  await assertQuoteStaffWriter();
  await insertMessage({
    conversationId,
    role: "staff",
    messageType: "text",
    body,
  });

  revalidatePath("/manage/quotes");
  revalidatePath("/account/quotes");
  revalidatePath(`${redirectBase}/${conversationId}`);
  revalidatePath(`/manage/quotes/${conversationId}`);
  revalidatePath(`/quotes/${conversationId}`);
  redirect(destination(`${redirectBase}/${conversationId}`, "saved", "Reply sent."));
}

export async function markQuoteStaffRead(conversationId: string) {
  if (!conversationId) return;
  await assertQuoteStaffWriter();
  await markStaffRead(conversationId);
  revalidatePath("/manage/quotes");
  revalidatePath("/account/quotes");
  revalidatePath(`/manage/quotes/${conversationId}`);
  revalidatePath(`/account/quotes/${conversationId}`);
}
