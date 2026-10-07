import type { Metadata } from "next";
import type { ReactNode } from "react";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Checkout",
  ...privateMetadata,
};

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children;
}
