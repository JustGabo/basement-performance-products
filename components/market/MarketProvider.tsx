"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { MarketCountry } from "@/lib/commerce/market";

type MarketContextValue = {
  country: MarketCountry;
  changing: boolean;
  setCountry: (country: MarketCountry) => Promise<void>;
};

const MarketContext = createContext<MarketContextValue | null>(null);

export function MarketProvider({ initialCountry, children }: { initialCountry: MarketCountry; children: ReactNode }) {
  const router = useRouter();
  const [country, updateCountry] = useState(initialCountry);
  const [changing, setChanging] = useState(false);

  const value = useMemo<MarketContextValue>(() => ({
    country,
    changing,
    async setCountry(nextCountry) {
      if (nextCountry === country) return;
      setChanging(true);
      const response = await fetch("/api/market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: nextCountry }),
      });
      if (!response.ok) {
        setChanging(false);
        throw new Error("Could not change market.");
      }
      window.localStorage.removeItem("basement-cart-v2");
      window.localStorage.removeItem("basement-cart-v1");
      updateCountry(nextCountry);
      router.refresh();
      window.location.reload();
    },
  }), [changing, country, router]);

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) throw new Error("useMarket must be used within MarketProvider.");
  return context;
}
