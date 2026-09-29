"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, FolderTree, Gauge, Images, Menu, PackageCheck, PanelsTopLeft, UsersRound } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const items = [
  { href: "/admin", label: "Overview", icon: Gauge },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: PackageCheck },
  { href: "/admin/customers", label: "Customers", icon: UsersRound },
  { href: "/admin/builds", label: "Builds", icon: Images },
  { href: "/admin/hero", label: "Hero", icon: PanelsTopLeft },
];

function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return <nav className="flex flex-col" aria-label="Administration navigation">{items.map(({ href, label, icon: Icon }) => {
    const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
    const link = <Link className={`flex min-h-14 items-center gap-3 border-b border-foreground/10 px-5 text-[10px] font-black tracking-[.08em] uppercase transition last:border-b-0 ${active ? "bg-brand text-black" : "text-foreground/55 hover:bg-foreground/5 hover:text-foreground"}`} href={href}><Icon size={18} />{label}</Link>;
    return mobile ? <SheetClose asChild key={href}>{link}</SheetClose> : <div key={href}>{link}</div>;
  })}</nav>;
}

export function AdminDesktopNavigation() {
  return <NavigationLinks />;
}

export function AdminMobileNavigation() {
  return <Sheet><SheetTrigger asChild><button className="grid size-10 cursor-pointer place-items-center border border-foreground/20 bg-panel lg:hidden" type="button" aria-label="Open admin navigation"><Menu size={19} /></button></SheetTrigger><SheetContent className="w-[min(340px,88vw)] border-foreground/15 bg-ink p-0 text-foreground" side="left"><SheetHeader className="border-b border-foreground/12 p-6"><SheetTitle className="font-display text-3xl font-bold uppercase">Control room</SheetTitle><SheetDescription className="text-xs text-foreground/50">Manage the Basement storefront.</SheetDescription></SheetHeader><NavigationLinks mobile /></SheetContent></Sheet>;
}
