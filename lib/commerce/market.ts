import "server-only";

import { headers } from "next/headers";

export type MarketCountry = "US" | "DO";
export const MARKET_COOKIE = "basement-market";

function asMarket(value: string | null | undefined): MarketCountry | null {
  const country = value?.trim().toUpperCase();
  return country === "US" || country === "DO" ? country : null;
}

export async function getMarketCountry(): Promise<MarketCountry> {
  const requestHeaders = await headers();
  return asMarket(requestHeaders.get("x-vercel-ip-country"))
    ?? asMarket(requestHeaders.get("cf-ipcountry"))
    ?? asMarket(process.env.DEFAULT_MARKET_COUNTRY)
    ?? "US";
}
