import type { Metadata } from "next";
import { pwaQuotesInboxPath } from "@/lib/pwa/config";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Quote inbox",
  description: "International shipping quote inbox shortcut for home screen bookmarks.",
  alternates: { canonical: pwaQuotesInboxPath },
  ...privateMetadata,
};

export default function QuotesInboxShortcutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
