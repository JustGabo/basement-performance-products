import type { ReactNode } from "react";

export default function QuotesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="safe-top-header flex h-dvh flex-col overflow-hidden bg-ink text-foreground">{children}</div>
  );
}
