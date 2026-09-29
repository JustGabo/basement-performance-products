import { NextRequest, NextResponse } from "next/server";
import { createCustomerAuthorizationUrl } from "@/lib/shopify/customer-account";

export async function GET(request: NextRequest) {
  try {
    const url = await createCustomerAuthorizationUrl(request.nextUrl.searchParams.get("next") ?? undefined, request.nextUrl.searchParams.get("locale") ?? undefined);
    return NextResponse.redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Customer sign-in is not available.";
    return NextResponse.redirect(new URL(`/sign-in?error=${encodeURIComponent(message)}`, request.url));
  }
}
