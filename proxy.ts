import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { refreshCustomerRequestCookie } from "@/lib/shopify/customer-account";
import { getShopifyAdminUrl } from "@/lib/shopify/urls";
import { updateSession } from "@/lib/supabase/proxy";

const CUSTOMER_SESSION_COOKIE = "bpp_shopify_customer";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin" || request.nextUrl.pathname.startsWith("/admin/")) {
    const destination = getShopifyAdminUrl();
    return NextResponse.redirect(destination.startsWith("http") ? destination : new URL(destination, request.url));
  }

  const sessionUpdate = await refreshCustomerRequestCookie(
    (name) => request.cookies.get(name)?.value,
    (name, value) => {
      if (value) request.cookies.set(name, value);
      else request.cookies.delete(name);
    },
  );
  const response = await updateSession(request);
  if (sessionUpdate && "clear" in sessionUpdate) response.cookies.delete(CUSTOMER_SESSION_COOKIE);
  if (sessionUpdate && "value" in sessionUpdate) {
    response.cookies.set(CUSTOMER_SESSION_COOKIE, sessionUpdate.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionUpdate.maxAge,
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
