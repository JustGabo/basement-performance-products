import "server-only";

import { cookies } from "next/headers";

export type StoreLocale = "en" | "es";

export async function getStoreLocale(): Promise<StoreLocale> {
  const cookieStore = await cookies();
  return cookieStore.get("basement-locale")?.value === "es" ? "es" : "en";
}

/** URL `?lang=` wins over cookie — used for SEO alternates and metadata. */
export async function resolveStoreLocale(
  searchParams?: Record<string, string | string[] | undefined> | null,
): Promise<StoreLocale> {
  const raw = searchParams?.lang;
  const lang = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  if (lang === "es") return "es";
  if (lang === "en") return "en";
  return getStoreLocale();
}
