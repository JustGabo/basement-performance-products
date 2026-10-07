import { CheckoutClient, type CheckoutPrefill } from "@/components/checkout/CheckoutClient";
import { getMarketCountry } from "@/lib/commerce/market";
import { getShopifyCustomer } from "@/lib/shopify/customer-data";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [customer, marketCountry] = await Promise.all([
    getShopifyCustomer({ orders: 1, addresses: 1 }),
    getMarketCountry(),
  ]);
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
    countryCode: marketCountry,
  };

  return <CheckoutClient prefill={prefill} />;
}
