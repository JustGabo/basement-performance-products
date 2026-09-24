import { NextResponse } from "next/server";
import { paypalRequest } from "@/lib/paypal/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type CaptureResponse = {
  id: string;
  status: string;
  purchase_units?: Array<{ payments?: { captures?: Array<{ id: string; status: string; amount?: { currency_code: string; value: string } }> } }>;
};

export async function POST(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId: paypalOrderId } = await params;
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;
    if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const admin = createAdminClient();
    const { data: payment, error } = await admin.from("payments")
      .select("id, order_id, status, amount_cents, currency, orders!inner(id, order_number, user_id, status, payment_status)")
      .eq("provider", "paypal")
      .eq("provider_order_id", paypalOrderId)
      .single();
    if (error || !payment) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const order = Array.isArray(payment.orders) ? payment.orders[0] : payment.orders;
    if (!order || order.user_id !== userId) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (payment.status === "paid" && order.payment_status === "paid") {
      return NextResponse.json({ orderId: order.id, orderNumber: order.order_number, status: "COMPLETED" });
    }

    const capture = await paypalRequest<CaptureResponse>(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
      method: "POST",
      body: "{}",
    });
    const captured = capture.purchase_units?.flatMap((unit) => unit.payments?.captures ?? [])[0];
    const capturedCents = captured?.amount ? Math.round(Number(captured.amount.value) * 100) : 0;
    const completed = capture.status === "COMPLETED" && captured?.status === "COMPLETED";
    if (!completed || capturedCents !== Number(payment.amount_cents) || captured?.amount?.currency_code !== payment.currency) {
      await admin.from("payments").update({ status: "failed", provider_payload: capture }).eq("id", payment.id);
      throw new Error("PayPal did not return a valid completed capture.");
    }

    await admin.from("payments").update({
      status: "paid",
      provider_capture_id: captured.id,
      provider_payload: capture,
    }).eq("id", payment.id);
    await admin.from("orders").update({
      status: "paid",
      payment_status: "paid",
      placed_at: new Date().toISOString(),
    }).eq("id", order.id).eq("user_id", userId);
    await admin.from("order_status_history").insert({ order_id: order.id, status: "paid", note: "PayPal payment captured." });

    return NextResponse.json({ orderId: order.id, orderNumber: order.order_number, status: capture.status });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not capture the order." }, { status: 500 });
  }
}
