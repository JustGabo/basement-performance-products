import Link from "next/link";
import { WifiOff } from "lucide-react";
import { pwaShortName } from "@/lib/pwa/config";

export default function OfflinePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-ink px-6 text-center text-foreground">
      <span className="grid size-16 place-items-center border border-brand/35 text-brand">
        <WifiOff size={28} />
      </span>
      <div className="flex max-w-md flex-col gap-2">
        <h1 className="font-display text-3xl font-bold uppercase">You&apos;re offline</h1>
        <p className="text-sm leading-6 text-foreground/55">
          {pwaShortName} needs a connection for checkout, quotes, and live chat. Reconnect and try again.
        </p>
      </div>
      <Link
        className="min-h-12 border border-brand bg-brand px-6 text-[10px] font-black text-black uppercase"
        href="/"
      >
        Back to home
      </Link>
    </main>
  );
}
