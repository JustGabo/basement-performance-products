import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function isQuoteStaffEmail(email: string | null | undefined) {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;

  const admin = createAdminClient();
  let page = 1;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data.users.length) return false;

    const user = data.users.find((item) => item.email?.toLowerCase() === normalized);
    if (user) {
      const { data: profile } = await admin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      return profile?.role === "admin";
    }

    if (data.users.length < 200) break;
    page += 1;
  }

  return false;
}

export async function assertQuoteStaffWriter(): Promise<ReturnType<typeof createAdminClient>> {
  const { createClient } = await import("@/lib/supabase/server");
  const { redirect } = await import("next/navigation");
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    if (profile?.role === "admin") {
      return createAdminClient();
    }
  }

  const { getShopifyCustomer } = await import("@/lib/shopify/customer-data");
  const customer = await getShopifyCustomer({ orders: 0, addresses: 0 });
  const email = customer?.emailAddress?.emailAddress;
  if (await isQuoteStaffEmail(email)) {
    return createAdminClient();
  }

  redirect("/sign-in?next=/account/quotes&error=Quote+staff+access+required.");
  throw new Error("Admin access required.");
}

export function quoteStaffRedirectBase(raw: FormData | string | null | undefined) {
  const value = typeof raw === "string" ? raw : String(raw?.get("redirect_base") ?? "/manage/quotes");
  if (value.startsWith("/account/quotes")) return "/account/quotes";
  return "/manage/quotes";
}
