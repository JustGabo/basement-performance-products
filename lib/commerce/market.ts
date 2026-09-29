import "server-only";

import { headers } from "next/headers";

export type MarketCountry = "US" | "DO";

export async function getMarketCountry(): Promise<MarketCountry> {
  const requestHeaders = await headers();
  const detected = requestHeaders.get("x-vercel-ip-country")
    ?? requestHeaders.get("cf-ipcountry")
    ?? process.env.DEFAULT_MARKET_COUNTRY
    ?? "US";

  return detected.toUpperCase() === "DO" ? "DO" : "US";
}
