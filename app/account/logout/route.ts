import { NextResponse } from "next/server";
import { clearCustomerSession, getCustomerLogoutUrl } from "@/lib/shopify/customer-account";

export async function GET() {
  const session = await clearCustomerSession();
  return NextResponse.redirect(await getCustomerLogoutUrl(session?.idToken));
}
