import Link from "next/link";
import { Zap } from "lucide-react";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return <Link className="flex w-max items-center gap-4 justify-self-center max-[700px]:gap-2.5" href="/" aria-label="Basement Performance Products home">
    <Zap className={`fill-brand text-brand drop-shadow-[0_0_8px_rgba(243,180,2,.2)] max-[700px]:order-2 ${compact ? "h-5 w-4" : "h-7 w-5 max-[700px]:h-5.5 max-[700px]:w-4"}`} />
    <strong className={`leading-none font-black tracking-[-.05em] italic max-[700px]:order-1 ${compact ? "text-[24px]" : "text-[30px] max-[700px]:text-[23px]"}`}>BASEMENT</strong>
    <span className="border-l border-foreground/35 pl-4 text-[8px] leading-[1.4] font-bold tracking-[.28em] uppercase max-[700px]:hidden">Performance<br />Products</span>
  </Link>;
}
