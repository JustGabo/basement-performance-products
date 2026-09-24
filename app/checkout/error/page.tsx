import { CheckoutStatus } from "@/components/checkout/CheckoutStatus";

export default async function CheckoutErrorPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  return <CheckoutStatus kind="error" message={message} />;
}
