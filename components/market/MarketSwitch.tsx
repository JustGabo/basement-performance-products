"use client";

import { LoaderCircle } from "lucide-react";
import { useMarket } from "./MarketProvider";

export function MarketSwitch({ compact = false }: { compact?: boolean }) {
  const { country, changing, setCountry } = useMarket();

  return <div className="flex items-center gap-0.5 rounded-full border border-foreground/20 bg-panel/60 p-1" role="group" aria-label="Shopping market">
    {(["US", "DO"] as const).map((item) => <button
      className={`grid h-6 min-w-8 cursor-pointer place-items-center rounded-full px-1 text-[8px] font-black transition disabled:cursor-wait ${country === item ? "bg-brand text-black" : "text-foreground/45 hover:text-foreground"} ${compact ? "min-w-7" : ""}`}
      disabled={changing}
      type="button"
      onClick={() => void setCountry(item)}
      aria-pressed={country === item}
      key={item}
    >{changing && country !== item ? <LoaderCircle className="animate-spin" size={11} /> : item}</button>)}
  </div>;
}
