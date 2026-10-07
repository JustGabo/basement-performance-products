import type { Metadata } from "next";
import type { ReactNode } from "react";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Cart",
  ...privateMetadata,
};

export default function CartLayout({ children }: { children: ReactNode }) {
  return children;
}
