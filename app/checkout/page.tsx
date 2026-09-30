import { redirect } from "next/navigation";
import { CheckoutClient, type CheckoutPrefill } from "@/components/checkout/CheckoutClient";
import { createClient } from "@/lib/supabase/server";
import { getShopifyCustomer } from "@/lib/shopify/customer-data";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  if (process.env.COMMERCE_PROVIDER === "shopify") {
    const customer = await getShopifyCustomer({ orders: 1, addresses: 1 });
    const address = customer?.addresses.nodes[0];
    const prefill: CheckoutPrefill = {
      email: customer?.emailAddress?.emailAddress ?? "",
      firstName: customer?.firstName ?? "",
      lastName: customer?.lastName ?? "",
      phone: address?.phoneNumber ?? "",
      line1: "",
      line2: "",
      city: "",
      stateRegion: "",
      postalCode: "",
      countryCode: process.env.DEFAULT_MARKET_COUNTRY === "DO" ? "DO" : "US",
    };

    return <CheckoutClient
      clientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ""}
      environment={process.env.PAYPAL_ENV === "live" ? "production" : "sandbox"}
      prefill={prefill}
      commerceProvider="shopify"
    />;
  }

  const supabase = await createClient();
  const { data: claimsData, error } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (error || !userId) redirect("/sign-in?next=/checkout");

  const email = typeof claimsData.claims.email === "string" ? claimsData.claims.email : "";
  const [{ data: profile }, { data: address }] = await Promise.all([
    supabase.from("profiles").select("first_name, last_name, phone").eq("id", userId).maybeSingle(),
    supabase.from("addresses").select("recipient_name, line_1, line_2, city, state_region, postal_code, country_code, phone").eq("user_id", userId).order("is_default_shipping", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const recipient = address?.recipient_name?.trim().split(/\s+/) ?? [];
  const prefill: CheckoutPrefill = {
    email,
    firstName: profile?.first_name ?? recipient[0] ?? "",
    lastName: profile?.last_name ?? recipient.slice(1).join(" ") ?? "",
    phone: address?.phone ?? profile?.phone ?? "",
    line1: address?.line_1 ?? "",
    line2: address?.line_2 ?? "",
    city: address?.city ?? "",
    stateRegion: address?.state_region ?? "",
    postalCode: address?.postal_code ?? "",
    countryCode: address?.country_code ?? "US",
  };

  return <CheckoutClient
    clientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ""}
    environment={process.env.PAYPAL_ENV === "live" ? "production" : "sandbox"}
    prefill={prefill}
    commerceProvider={process.env.COMMERCE_PROVIDER === "shopify" ? "shopify" : "paypal"}
  />;
}
