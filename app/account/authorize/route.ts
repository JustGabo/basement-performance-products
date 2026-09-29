import { NextRequest, NextResponse } from "next/server";
import { completeCustomerAuthorization } from "@/lib/shopify/customer-account";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const oauthError = request.nextUrl.searchParams.get("error_description") || request.nextUrl.searchParams.get("error");
  if (oauthError || !code || !state) {
    return NextResponse.redirect(new URL(`/sign-in?error=${encodeURIComponent(oauthError || "Shopify did not return a valid authorization code.")}`, request.url));
  }
  try {
    const next = await completeCustomerAuthorization(code, state);
    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Shopify sign-in could not be completed.";
    return NextResponse.redirect(new URL(`/sign-in?error=${encodeURIComponent(message)}`, request.url));
  }
}
