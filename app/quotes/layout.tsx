import type { Metadata } from "next";
import type { ReactNode } from "react";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Quotes",
  ...privateMetadata,
};

export default function QuotesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="safe-top-header flex h-dvh flex-col overflow-hidden bg-ink text-foreground">{children}</div>
  );
}
