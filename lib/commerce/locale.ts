import "server-only";

import { cookies } from "next/headers";

export type StoreLocale = "en" | "es";

export async function getStoreLocale(): Promise<StoreLocale> {
  const cookieStore = await cookies();
  return cookieStore.get("basement-locale")?.value === "es" ? "es" : "en";
}
