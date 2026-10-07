import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard, LogOut, MapPin, Package, ShieldCheck, UserRound } from "lucide-react";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { BrandLogo } from "@/components/site/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { getCustomerSession } from "@/lib/shopify/customer-account";
import { getShopifyCustomer } from "@/lib/shopify/customer-data";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Account",
  ...privateMetadata,
};

export const dynamic = "force-dynamic";

const navigation = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/profile", label: "Profile & security", icon: ShieldCheck },
];

export default async function AccountLayout({ children }: { children: ReactNode }) {
  if (!await getCustomerSession()) redirect("/sign-in");
  const customer = await getShopifyCustomer({ orders: 1, addresses: 1 });
  if (!customer) redirect("/sign-in");
  const email = customer.emailAddress?.emailAddress || "Shopify customer";
  const fullName = customer.displayName || email.split("@")[0];

  return <main className="min-h-svh bg-ink text-foreground transition-colors">
    <header className="sticky top-0 z-30 border-b border-foreground/12 bg-ink/88 backdrop-blur-xl">
      <div className="mx-auto grid h-20 w-[min(1480px,calc(100%_-_56px))] grid-cols-[1fr_auto_1fr] items-center gap-5 max-[700px]:h-16 max-[700px]:w-[calc(100%_-_32px)]">
        <Link className="flex items-center gap-2 text-[10px] font-black tracking-[.08em] text-foreground/60 uppercase transition hover:text-brand" href="/"><ArrowLeft size={17} />Shop</Link>
        <BrandLogo compact />
        <div className="flex items-center justify-self-end gap-3"><ThemeToggle compact /><CartDrawer /></div>
      </div>
    </header>

    <div className="mx-auto grid w-[min(1280px,calc(100%_-_56px))] grid-cols-[260px_minmax(0,1fr)] items-start gap-10 py-12 max-[900px]:grid-cols-1 max-[700px]:w-[calc(100%_-_32px)] max-[700px]:gap-7 max-[700px]:py-8">
      <aside className="sticky top-28 flex flex-col gap-5 max-[900px]:static">
        <div className="flex items-center gap-3 border border-foreground/12 bg-panel p-4"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-black"><UserRound size={20} /></span><div className="min-w-0"><p className="truncate text-sm font-bold">{fullName}</p><p className="truncate text-[10px] text-foreground/45">{email}</p></div></div>
        <nav className="grid border border-foreground/12 bg-panel max-[900px]:grid-cols-2" aria-label="Account navigation">{navigation.map(({ href, label, icon: Icon }) => <Link className="flex min-h-13 items-center gap-3 border-b border-foreground/10 px-4 text-[10px] font-black tracking-[.04em] uppercase transition last:border-b-0 hover:bg-brand hover:text-black max-[900px]:border-r max-[900px]:last:border-b" href={href} key={href}><Icon size={17} />{label}</Link>)}</nav>
        <a className="flex w-full items-center gap-3 px-1 text-[10px] font-black tracking-[.06em] text-foreground/50 uppercase transition hover:text-brand" href="/account/logout"><LogOut size={17} />Sign out</a>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  </main>;
}
