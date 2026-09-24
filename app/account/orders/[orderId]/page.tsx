import { notFound } from "next/navigation";
import { OrderReceipt } from "@/components/orders/OrderReceipt";
import { getCustomerOrder } from "@/lib/orders/server";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const { order } = await getCustomerOrder(orderId);
  if (!order) notFound();
  return <section className="flex flex-col gap-7"><div className="flex flex-col gap-2"><p className="text-[10px] font-black tracking-[.18em] text-brand uppercase">Your purchase</p><h1 className="font-display text-[clamp(46px,6vw,72px)] leading-[.9] font-bold uppercase">Order details</h1></div><OrderReceipt order={order} /></section>;
}
