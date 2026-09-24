"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function authenticatedUserId() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || !userId) redirect("/sign-in");
  return { supabase, userId };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function addAddress(formData: FormData) {
  const { supabase, userId } = await authenticatedUserId();
  const countryCode = String(formData.get("countryCode") ?? "").trim().toUpperCase();
  const defaultShipping = formData.get("defaultShipping") === "on";
  const defaultBilling = formData.get("defaultBilling") === "on";

  if (countryCode.length !== 2) throw new Error("Country code must contain two letters.");

  if (defaultShipping) await supabase.from("addresses").update({ is_default_shipping: false }).eq("user_id", userId);
  if (defaultBilling) await supabase.from("addresses").update({ is_default_billing: false }).eq("user_id", userId);

  const { error } = await supabase.from("addresses").insert({
    user_id: userId,
    label: String(formData.get("label") ?? "Home").trim(),
    recipient_name: String(formData.get("recipientName") ?? "").trim(),
    company: String(formData.get("company") ?? "").trim() || null,
    line_1: String(formData.get("line1") ?? "").trim(),
    line_2: String(formData.get("line2") ?? "").trim() || null,
    city: String(formData.get("city") ?? "").trim(),
    state_region: String(formData.get("stateRegion") ?? "").trim() || null,
    postal_code: String(formData.get("postalCode") ?? "").trim() || null,
    country_code: countryCode,
    phone: String(formData.get("phone") ?? "").trim() || null,
    is_default_shipping: defaultShipping,
    is_default_billing: defaultBilling,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/account");
  revalidatePath("/account/addresses");
}

export async function deleteAddress(formData: FormData) {
  const { supabase, userId } = await authenticatedUserId();
  const addressId = String(formData.get("addressId") ?? "");
  const { error } = await supabase.from("addresses").delete().eq("id", addressId).eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/account");
  revalidatePath("/account/addresses");
}

export async function updateProfile(formData: FormData) {
  const { supabase, userId } = await authenticatedUserId();
  const { error } = await supabase.from("profiles").update({
    first_name: String(formData.get("firstName") ?? "").trim(),
    last_name: String(formData.get("lastName") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || null,
    marketing_opt_in: formData.get("marketing") === "on",
  }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/account", "layout");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");
  if (password.length < 8) throw new Error("Password must contain at least eight characters.");
  if (password !== confirmation) throw new Error("Passwords do not match.");

  const { supabase } = await authenticatedUserId();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
}
