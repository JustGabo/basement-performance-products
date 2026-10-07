import type { Metadata } from "next";
import Link from "next/link";
import { StatusScreen } from "@/components/site/StatusScreen";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return <StatusScreen
    code="404"
    title="Page not found."
    body="That link does not match a product, build, or page on this site."
    secondary={<Link className="flex min-h-12 items-center justify-center border border-brand px-6 text-[10px] font-black tracking-[.08em] text-brand uppercase" href="/shop">Browse products</Link>}
  />;
}
