import type { Metadata } from "next";
import { privateMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage",
  ...privateMetadata,
};

export default function ManageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
