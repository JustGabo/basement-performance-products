import "server-only";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) redirect("/sign-in?next=/admin");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("first_name, last_name, role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") redirect("/account");

  const email = typeof claimsData.claims.email === "string" ? claimsData.claims.email : "Admin";
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || email.split("@")[0];

  return { userId, email, fullName, admin: createAdminClient() };
}
