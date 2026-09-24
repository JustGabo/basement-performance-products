import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { OrderReceipt } from "@/components/orders/OrderReceipt";
import { BrandLogo } from "@/components/site/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { getCustomerOrder } from "@/lib/orders/server";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: orderId } = await searchParams;
  if (!orderId) redirect("/account/orders");
  const { userId, order } = await getCustomerOrder(orderId);
  if (!userId) redirect(`/sign-in?next=${encodeURIComponent(`/checkout/success?order=${orderId}`)}`);
  if (!order) redirect("/account/orders");

  return <main className="min-h-svh bg-ink text-foreground"><header className="sticky top-0 z-30 border-b border-foreground/12 bg-ink/90 backdrop-blur-xl"><div className="mx-auto grid h-20 w-[min(1480px,calc(100%_-_56px))] grid-cols-[1fr_auto_1fr] items-center gap-5 max-[700px]:h-16 max-[700px]:w-[calc(100%_-_32px)]"><Link className="flex w-fit items-center gap-2 text-[9px] font-black text-foreground/55 uppercase hover:text-brand" href="/"><ArrowLeft size={16} />Shop</Link><BrandLogo compact /><div className="justify-self-end"><ThemeToggle compact /></div></div></header><div className="mx-auto w-[min(1200px,calc(100%_-_56px))] py-12 max-[700px]:w-[calc(100%_-_32px)] max-[700px]:py-8"><OrderReceipt order={order} confirmation /></div></main>;
}
